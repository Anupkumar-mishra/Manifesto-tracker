import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from scheduler.jobs import run_daily_classification, run_health_check
import logging

logging.basicConfig(level=logging.INFO)

def start_scheduler():
    scheduler = BlockingScheduler()

    # Daily classification at 7 AM
    scheduler.add_job(
        run_daily_classification,
        CronTrigger(hour=7, minute=0),
        id='daily_classification',
        name='Daily Promise Classification'
    )

    # Health check at 5 AM
    scheduler.add_job(
        run_health_check,
        CronTrigger(hour=5, minute=0),
        id='health_check',
        name='Scraper Health Check'
    )

    print("⏰ Scheduler started!")
    print("   Daily classification: 7:00 AM")
    print("   Health check: 5:00 AM")
    print("   Press Ctrl+C to stop")

    try:
        scheduler.start()
    except KeyboardInterrupt:
        print("\n👋 Scheduler stopped")
        scheduler.shutdown()

if __name__ == '__main__':
    start_scheduler()