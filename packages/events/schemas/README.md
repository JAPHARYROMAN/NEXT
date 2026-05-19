# Event schemas

Source of truth for every event flowing on the NEXT Kafka bus. Per [docs/event-architecture.md](../../../docs/event-architecture.md).

## Conventions

- Filenames: `<event_lowercase>.proto`.
- One message per file.
- Every message includes `event_id` (UUID), `emitted_at` (timestamp), and at least one aggregate key (e.g. `user_id`, `video_id`).
- Validation via [protovalidate](https://github.com/bufbuild/protovalidate) annotations.
- Compatibility: backwards-compatible additions only within a `v<n>`; breaking changes emit a new `v<n+1>` topic.

## Code generation

```bash
buf generate                       # all languages
task codegen                       # from the repo root
```

Outputs land in `gen/go`, `gen/ts`, `gen/python`. Generated code is gitignored; CI regenerates and verifies no drift between schema and consumer call-sites.

## Adding a new event

1. Add a new `.proto` file under the right `<domain>/v1/` subdirectory.
2. Add the topic constant to [`packages/events/src/topics.ts`](../src/topics.ts).
3. Add a producer call in the owning service.
4. Add the consumer in the receiving service(s).
5. Update the topic catalog in [docs/event-architecture.md](../../../docs/event-architecture.md).
6. Document partition key and retention if non-default.
