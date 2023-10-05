import cron from "node-cron";

import { exec } from "child_process";

export class AppCron {
  installTask(taskId: string, minutes: number, hours: number, command: string) {
    const cronString = `${minutes} ${hours} * * * `;

    const schedule = cron.schedule(
      cronString,
      () => {
        try {
          console.log(command);
          exec(command);
        } catch (err) {
          console.log(err);
        }
      },
      { name: taskId, scheduled: false, timezone: "Europe/Warsaw" }
    );
    schedule.start();
  }
}
