"""OpenTelemetry bootstrap for NEXT Python services.

Call `init()` once at process start; the shutdown hook is registered automatically.
"""

from __future__ import annotations

import atexit
import os
from dataclasses import dataclass

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


@dataclass(frozen=True)
class Config:
    service: str
    namespace: str
    environment: str  # dev | staging | prod | test
    version: str = "0.0.0"
    otlp_endpoint: str | None = None


def init(cfg: Config) -> None:
    endpoint = cfg.otlp_endpoint or os.getenv(
        "OTEL_EXPORTER_OTLP_ENDPOINT", "otel-collector.next-observability:4317"
    )

    resource = Resource.create(
        {
            "service.name": cfg.service,
            "service.namespace": cfg.namespace,
            "service.version": cfg.version,
            "deployment.environment.name": cfg.environment,
        }
    )
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint, insecure=True)))
    trace.set_tracer_provider(provider)
    atexit.register(provider.shutdown)


__all__ = ["Config", "init"]
