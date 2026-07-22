import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

@Module({
  controllers: [MetricsController],
})
export class MetricsModule {}
