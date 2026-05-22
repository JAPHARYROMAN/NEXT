export interface TelemetryEvent {
  readonly name: string;
  readonly properties?: Record<string, string | number | boolean>;
}

type TelemetrySink = (event: TelemetryEvent) => void;

let sink: TelemetrySink = (event) => {
  if (process.env['NODE_ENV'] === 'development') {
    console.debug('[telemetry]', event.name, event.properties);
  }
};

export function setTelemetrySink(next: TelemetrySink): void {
  sink = next;
}

export function track(event: TelemetryEvent): void {
  sink(event);
}

export function trackNavigation(from: string, to: string, durationMs: number): void {
  track({ name: 'navigation', properties: { from, to, durationMs } });
}

export function trackInteraction(action: string, target: string, latencyMs: number): void {
  track({ name: 'interaction', properties: { action, target, latencyMs } });
}

export function trackRender(component: string, durationMs: number): void {
  track({ name: 'render', properties: { component, durationMs } });
}

export function trackError(error: string, surface: string): void {
  track({ name: 'error', properties: { error, surface } });
}

export function trackUploadFlow(
  step: string,
  properties?: Record<string, string | number | boolean>,
): void {
  track({ name: 'upload_flow', properties: { step, ...properties } });
}

export function trackAnimationPerf(component: string, durationMs: number, fps?: number): void {
  track({
    name: 'animation_perf',
    properties: { component, durationMs, ...(fps != null ? { fps } : {}) },
  });
}

export function trackPlaybackQoe(
  metric: 'startup' | 'rebuffer' | 'quality' | 'complete',
  valueMs: number,
): void {
  track({ name: 'playback_qoe', properties: { metric, valueMs } });
}

export function trackWorkflowFriction(
  workflow: string,
  friction: string,
  severity: 'low' | 'medium' | 'high',
): void {
  track({ name: 'workflow_friction', properties: { workflow, friction, severity } });
}

export function trackFeedLatency(mode: string, latencyMs: number): void {
  track({ name: 'feed_latency', properties: { mode, latencyMs } });
}

export function trackScrollPerf(surface: string, scrollOffset: number): void {
  track({ name: 'scroll_perf', properties: { surface, scrollOffset } });
}

export function trackDiscussionLatency(action: string, latencyMs: number): void {
  track({ name: 'discussion_latency', properties: { action, latencyMs } });
}

export function trackWatchPartyJoin(partyId: string, participantCount: number): void {
  track({ name: 'watch_party_join', properties: { partyId, participantCount } });
}

export function trackReactionPerf(symbol: string, latencyMs: number): void {
  track({ name: 'reaction_perf', properties: { symbol, latencyMs } });
}

export function trackDiscoveryEngagement(
  surface: string,
  action: string,
  properties?: Record<string, string | number | boolean>,
): void {
  track({
    name: 'discovery_engagement',
    properties: { surface, action, ...properties },
  });
}

export function trackSearchLatency(query: string, latencyMs: number, intent: string): void {
  track({ name: 'search_latency', properties: { query, latencyMs, intent } });
}

export function trackSearchResultClick(section: string, itemId: string, intent: string): void {
  track({ name: 'search_result_click', properties: { section, itemId, intent } });
}

export function trackQueryRefinement(chipId: string, query: string): void {
  track({ name: 'query_refinement', properties: { chipId, query } });
}

export function trackChaosEntry(source: string): void {
  track({ name: 'chaos_entry', properties: { source } });
}

export function trackShelfEngagement(shelf: string, action: string): void {
  track({ name: 'shelf_engagement', properties: { shelf, action } });
}

export function trackZeroResultFriction(query: string, intent: string): void {
  track({ name: 'zero_result_friction', properties: { query, intent } });
}

export function trackGestureLatency(gesture: string, target: string, latencyMs: number): void {
  track({ name: 'gesture_latency', properties: { gesture, target, latencyMs } });
}

export function trackMobileNavTiming(route: string, durationMs: number): void {
  track({ name: 'mobile_nav_timing', properties: { route, durationMs } });
}

export function trackMobileRenderPerf(surface: string, durationMs: number): void {
  track({ name: 'mobile_render_perf', properties: { surface, durationMs } });
}

export function trackOfflineFriction(
  workflow: string,
  friction: string,
  severity: 'low' | 'medium' | 'high',
): void {
  track({ name: 'offline_friction', properties: { workflow, friction, severity } });
}

export function trackPlaybackResponsiveness(action: string, latencyMs: number): void {
  track({ name: 'playback_responsiveness', properties: { action, latencyMs } });
}

export function trackContinuityHandoff(from: string, to: string, mediaId: string): void {
  track({ name: 'continuity_handoff', properties: { from, to, mediaId } });
}

export function trackRemoteLatency(action: string, latencyMs: number): void {
  track({ name: 'remote_latency', properties: { action, latencyMs } });
}

export function trackFocusTransition(from: string, to: string, durationMs: number): void {
  track({ name: 'focus_transition', properties: { from, to, durationMs } });
}

export function trackOverlayTiming(overlay: string, visibleMs: number): void {
  track({ name: 'overlay_timing', properties: { overlay, visibleMs } });
}

export function trackTvRenderPerf(surface: string, durationMs: number): void {
  track({ name: 'tv_render_perf', properties: { surface, durationMs } });
}

export function trackTvShelfEngagement(shelf: string, action: string): void {
  track({ name: 'tv_shelf_engagement', properties: { shelf, action } });
}

export function trackImmersiveEngagement(surface: string, mode: string, action: string): void {
  track({ name: 'immersive_engagement', properties: { surface, mode, action } });
}

export function trackImmersiveRenderPerf(surface: string, durationMs: number): void {
  track({ name: 'immersive_render_perf', properties: { surface, durationMs } });
}

export function trackMotionSmoothness(component: string, fps: number): void {
  track({ name: 'motion_smoothness', properties: { component, fps } });
}

export function trackGpuStressPlaceholder(surface: string, tier: 'low' | 'mid' | 'high'): void {
  track({ name: 'gpu_stress_placeholder', properties: { surface, tier } });
}

export function trackSpatialFocusTransition(from: string, to: string, depth: number): void {
  track({ name: 'spatial_focus_transition', properties: { from, to, depth } });
}

export function trackSubscriptionFlow(
  step: string,
  properties?: Record<string, string | number | boolean>,
): void {
  track({ name: 'subscription_flow', properties: { step, ...properties } });
}

export function trackTierComparison(tierId: string, action: string): void {
  track({ name: 'tier_comparison', properties: { tierId, action } });
}

export function trackPayoutInteraction(action: string, payoutId?: string): void {
  track({ name: 'payout_interaction', properties: { action, ...(payoutId ? { payoutId } : {}) } });
}

export function trackStorefrontEngagement(action: string, productId?: string): void {
  track({
    name: 'storefront_engagement',
    properties: { action, ...(productId ? { productId } : {}) },
  });
}

export function trackSponsorshipDropoff(step: string, opportunityId?: string): void {
  track({
    name: 'sponsorship_dropoff',
    properties: { step, ...(opportunityId ? { opportunityId } : {}) },
  });
}

export function trackEntitlementImpression(resourceId: string, state: string): void {
  track({ name: 'entitlement_impression', properties: { resourceId, state } });
}

export function trackLiveGoLiveFriction(step: string, severity: 'low' | 'medium' | 'high'): void {
  track({ name: 'live_go_live_friction', properties: { step, severity } });
}

export function trackControlRoomLatency(action: string, latencyMs: number): void {
  track({ name: 'control_room_latency', properties: { action, latencyMs } });
}

export function trackStreamHealthPanel(metric: string, viewedMs: number): void {
  track({ name: 'stream_health_panel', properties: { metric, viewedMs } });
}

export function trackLiveChatRender(messageCount: number, durationMs: number): void {
  track({ name: 'live_chat_render', properties: { messageCount, durationMs } });
}

export function trackLiveClipInteraction(action: string, clipId?: string): void {
  track({
    name: 'live_clip_interaction',
    properties: { action, ...(clipId ? { clipId } : {}) },
  });
}

export function trackLiveEventConversion(eventId: string, action: string): void {
  track({ name: 'live_event_conversion', properties: { eventId, action } });
}

export function trackLiveViewingEngagement(
  streamId: string,
  action: string,
  properties?: Record<string, string | number | boolean>,
): void {
  track({
    name: 'live_viewing_engagement',
    properties: { streamId, action, ...properties },
  });
}
