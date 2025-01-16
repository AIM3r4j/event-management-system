import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUE_NAME } from '../../config/constants'
import { QueueService } from './queue.service';

@Processor(QUEUE_NAME)
export class QueueProcessor {

  constructor(private queueService: QueueService) { }

  @Process(QUEUE_NAME)
  async processQueue(job: Job) {
    await this.queueService.processDynamicEmail(job.data)
    return true
  }

}