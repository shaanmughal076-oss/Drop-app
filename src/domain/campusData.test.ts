import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPUS_ZONES,
  INITIAL_CAMPUS_METRICS,
  INITIAL_DROP_ORDERS,
  INITIAL_ORBIT_TUTORIAL_STATE,
  ORBIT_TUTORIAL_COPY,
  buildPublicShareLink,
  calculateRoofElevation,
  computeOrderVelocitySummary,
  computeZoneCameraPose,
  createDispatchedOrder,
  evaluateOrbitTutorialInteraction,
  filterOrdersByCategory,
  generateZoneOrderVelocitySeries,
  getAmbientSoundscapeForZone,
  getApkAndPwaInstallSteps,
  validateOrderDispatch,
} from './campusData';

test('calculateRoofElevation computes closed and open-roof cutaway states accurately', () => {
  const closed = calculateRoofElevation(0, 5.4);
  assert.equal(closed.roofY, 5.4);
  assert.equal(closed.roofOpacity, 1);
  assert.equal(closed.isCutawayOpen, false);

  const open = calculateRoofElevation(1, 5.4);
  assert.equal(open.roofY, 19.9);
  assert.equal(open.roofOpacity, 0.08);
  assert.equal(open.isCutawayOpen, true);
});

test('validateOrderDispatch rejects empty or invalid inputs and accepts valid Joya order', () => {
  const invalid = validateOrderDispatch({
    merchantName: 'AB',
    category: 'food',
    pickupSector: 'NH-9 Highway Chowk, Joya',
    dropDestination: 'NH-9 Highway Chowk, Joya',
    amountInr: '15',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.merchantName);
  assert.ok(invalid.errors.dropDestination);
  assert.ok(invalid.errors.amountInr);

  const valid = validateOrderDispatch({
    merchantName: 'Zaika Darbar Restaurant',
    category: 'food',
    pickupSector: 'NH-9 Highway Chowk, Joya',
    dropDestination: 'Civil Lines & Block Office, Joya',
    amountInr: '540',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('createDispatchedOrder prepends new order and increments live metrics', () => {
  const result = createDispatchedOrder(
    {
      merchantName: 'Amroha Dairy & Sweets',
      category: 'grocery',
      pickupSector: 'Joya Main Market Bazaar',
      dropDestination: 'Mandi Samiti Gate, Joya',
      amountInr: '850',
    },
    INITIAL_DROP_ORDERS,
    INITIAL_CAMPUS_METRICS,
  );

  assert.equal(result.order.merchantName, 'Amroha Dairy & Sweets');
  assert.equal(result.order.amountInr, 850);
  assert.equal(result.updatedOrders.length, INITIAL_DROP_ORDERS.length + 1);
  assert.equal(result.updatedMetrics.liveOrders, INITIAL_CAMPUS_METRICS.liveOrders + 1);
  assert.equal(result.updatedMetrics.dailyGmvInr, INITIAL_CAMPUS_METRICS.dailyGmvInr + 850);
});

test('filterOrdersByCategory filters accurately and computeZoneCameraPose returns valid coordinates', () => {
  const foodOrders = filterOrdersByCategory(INITIAL_DROP_ORDERS, 'food');
  assert.equal(foodOrders.length, 2);
  const allOrders = filterOrdersByCategory(INITIAL_DROP_ORDERS, 'all');
  assert.equal(allOrders.length, INITIAL_DROP_ORDERS.length);

  const dispatchPose = computeZoneCameraPose('dispatch', 1);
  assert.equal(dispatchPose.position.length, 3);
  assert.equal(CAMPUS_ZONES.length, 6);
});

test('getAmbientSoundscapeForZone maps activeZone to distinct background audio tracks', () => {
  assert.equal(getAmbientSoundscapeForZone('overview').trackId, 'serene-wind');
  assert.equal(getAmbientSoundscapeForZone('dispatch').trackId, 'office-hustle');
  assert.equal(getAmbientSoundscapeForZone('executive').trackId, 'boardroom-poise');
  assert.equal(getAmbientSoundscapeForZone('engineering').trackId, 'server-hum');
  assert.equal(getAmbientSoundscapeForZone('merchant').trackId, 'lounge-warmth');
  assert.equal(getAmbientSoundscapeForZone('courtyard').trackId, 'fountain-plaza');
});

test('buildPublicShareLink and getApkAndPwaInstallSteps return complete public share URL and APK guide', () => {
  const sharePkg = buildPublicShareLink('http://localhost:3000', 'dispatch');
  assert.equal(
    sharePkg.shareUrl,
    'https://ais-pre-zzcpnloggrxeomltrq4uho-816539758515.asia-southeast1.run.app',
  );
  assert.ok(!sharePkg.shareUrl.includes('...'));
  assert.ok(sharePkg.whatsappText.includes(sharePkg.shareUrl));

  const customOriginPkg = buildPublicShareLink('https://drop-joya.run.app/', 'overview');
  assert.equal(customOriginPkg.shareUrl, 'https://drop-joya.run.app');

  const guide = getApkAndPwaInstallSteps();
  assert.equal(guide.noticeHeadline, 'APK Coming Soon - Abhi Web App Install Karo');
  assert.equal(guide.androidSteps.length, 3);
  assert.equal(guide.iosSteps.length, 3);
});

test('generateZoneOrderVelocitySeries and computeOrderVelocitySummary produce 60-minute order velocity data', () => {
  const dispatchSeries = generateZoneOrderVelocitySeries('dispatch', 194, 0);
  const execSeries = generateZoneOrderVelocitySeries('executive', 194, 0);
  assert.equal(dispatchSeries.length, 13);
  assert.equal(dispatchSeries[0].minutesAgo, 60);
  assert.equal(dispatchSeries[12].minutesAgo, 0);
  assert.equal(dispatchSeries[12].timeLabel, 'Now');

  const dispatchSummary = computeOrderVelocitySummary('dispatch', dispatchSeries);
  const execSummary = computeOrderVelocitySummary('executive', execSeries);
  assert.ok(dispatchSummary.avgRate > execSummary.avgRate);

  const boostedSeries = generateZoneOrderVelocitySeries('dispatch', 198, 0);
  assert.ok(boostedSeries[12].ordersPerMin > dispatchSeries[12].ordersPerMin);
});

test('evaluateOrbitTutorialInteraction accumulates drag distance and dismisses tutorial on orbit drag or manual dismiss', () => {
  assert.equal(ORBIT_TUTORIAL_COPY.headline, 'Drag to Orbit');
  assert.equal(INITIAL_ORBIT_TUTORIAL_STATE.visible, true);

  const partialDrag = evaluateOrbitTutorialInteraction(
    INITIAL_ORBIT_TUTORIAL_STATE,
    { type: 'drag', dragDeltaPx: 8 },
    14,
  );
  assert.equal(partialDrag.visible, true);
  assert.equal(partialDrag.dragDistancePx, 8);

  const completedDrag = evaluateOrbitTutorialInteraction(
    partialDrag,
    { type: 'drag', dragDeltaPx: 9 },
    14,
  );
  assert.equal(completedDrag.visible, false);
  assert.equal(completedDrag.hasInteracted, true);
  assert.equal(completedDrag.dismissedReason, 'dragged');

  const replayed = evaluateOrbitTutorialInteraction(completedDrag, {
    type: 'replay',
  });
  assert.equal(replayed.visible, true);
  assert.equal(replayed.dragDistancePx, 0);

  const manualDismiss = evaluateOrbitTutorialInteraction(replayed, {
    type: 'dismiss',
  });
  assert.equal(manualDismiss.visible, false);
  assert.equal(manualDismiss.dismissedReason, 'manual-dismiss');
});




