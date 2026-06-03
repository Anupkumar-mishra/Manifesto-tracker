import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from scheduler.scheduler import start_scheduler

if __name__ == '__main__':
    print("🚀 Starting Indian Manifesto Tracker Pipeline")
    print("=" * 50)
    start_scheduler()