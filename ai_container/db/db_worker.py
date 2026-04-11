from queue import Queue
import threading
import logging
import asyncio
import time


# ----------------------------
# Logging Configuration
# ----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

db_queue = Queue()


class DBWorker:

    def __init__(self):
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.loop = None  # ✅ persistent loop

    def start(self):
        self.thread.start()

    def run(self):
        logger.info("🧠 DB Worker started (sequential processing)")

        # ✅ Create ONE event loop for entire thread
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

        # Run async main loop
        self.loop.run_until_complete(self._run())

    async def _run(self):
        while True:
            task = db_queue.get()

            if task is None:
                break

            task_start = time.perf_counter()

            try:
                user_id = task.get("user_id", "unknown")
                print(f"\n🔄 Processing DB task for user {user_id}...")
                await self._save(task)
                task_time = time.perf_counter() - task_start
                print(f"✅ DB task completed in {task_time:.2f}s\n")
            except Exception as e:
                task_time = time.perf_counter() - task_start
                logger.exception(
                    f"❌ DB Worker error (after {task_time:.2f}s): {e}")
            finally:
                db_queue.task_done()

    async def _save(self, task):
        from .resume_repository import ResumeRepository
        from .session_manager import db_session_manager

        # Extract user_id for logging and timing
        user_id = task.get("user_id", "unknown")
        update_status = task.get("update_status", "N/A")

        print(f"\n💾 Saving profile to database for user {user_id}...")
        save_start = time.perf_counter()

        try:
            async with db_session_manager.session() as session:
                repo = ResumeRepository(session)

                if update_status != "N/A":
                    print(
                        f"   🔄 Updating resume_status to '{update_status}' for user {user_id}...")
                    await repo.update_user_resume_status(user_id, "processing")

                else:
                    await repo.save_profile_and_resume(**task)

            save_time = time.perf_counter() - save_start
            print(f"   ⏱️  Database save took {save_time:.2f}s")
            logger.info(
                f"✅ DB save completed for user {user_id} in {save_time:.2f}s")

        except Exception as e:
            save_time = time.perf_counter() - save_start
            print(f"   ❌ Database save failed after {save_time:.2f}s")
            logger.error(
                f"❌ DB save failed for user {user_id} after {save_time:.2f}s: {e}")
            raise
