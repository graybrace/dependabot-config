type ScheduleInterval = 'daily' | 'weekly' | 'monthly'

export interface Schedule {
    interval: ScheduleInterval
}