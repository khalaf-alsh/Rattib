import { createClient } from "@supabase/supabase-js";

import {
  buildPushPayload,
  type PushSubscription,
  type VapidKeys,
} from "@block65/webcrypto-web-push";

type Database = {
  public: {
    Tables: {
      daily_tasks: {
        Row: {
          id: number;
          user_id: string;
          title: string;

          task_date: string;

          start_time: string | null;
          end_time: string | null;

          notes: string | null;

          reminder: string;
          reminder_time: string | null;
          reminder_at: string | null;
          reminder_sent_at: string | null;

          time_zone: string | null;

          completed: boolean;

          created_at: string;
        };

        Insert: {
          id?: number;
          user_id: string;
          title: string;

          task_date: string;

          start_time?: string | null;
          end_time?: string | null;

          notes?: string | null;

          reminder?: string;
          reminder_time?: string | null;
          reminder_at?: string | null;
          reminder_sent_at?: string | null;

          time_zone?: string | null;

          completed?: boolean;

          created_at?: string;
        };

        Update: {
          id?: number;
          user_id?: string;
          title?: string;

          task_date?: string;

          start_time?: string | null;
          end_time?: string | null;

          notes?: string | null;

          reminder?: string;
          reminder_time?: string | null;
          reminder_at?: string | null;
          reminder_sent_at?: string | null;

          time_zone?: string | null;

          completed?: boolean;

          created_at?: string;
        };

        Relationships: [];
      };

      push_subscriptions: {
        Row: {
          id: number;
          user_id: string;

          endpoint: string;
          p256dh: string;
          auth: string;

          created_at: string;
          updated_at: string;
        };

        Insert: {
          id?: number;
          user_id: string;

          endpoint: string;
          p256dh: string;
          auth: string;

          created_at?: string;
          updated_at?: string;
        };

        Update: {
          id?: number;
          user_id?: string;

          endpoint?: string;
          p256dh?: string;
          auth?: string;

          created_at?: string;
          updated_at?: string;
        };

        Relationships: [];
      };
    };

    Views: Record<PropertyKey, never>;
    Functions: Record<PropertyKey, never>;
  };
};

type DueTask = {
  id: number;
  user_id: string;
  title: string;
  reminder_at: string;
};

type StoredPushSubscription = {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

const REMINDER_WINDOW_MINUTES = 5;

function getRequiredSecret(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}

const SUPABASE_URL = getRequiredSecret("SUPABASE_URL");

// Supabase provides server-side secret keys automatically to Edge Functions.
const SUPABASE_SECRET_KEYS = JSON.parse(
  getRequiredSecret("SUPABASE_SECRET_KEYS"),
) as Record<string, string>;

const SUPABASE_SECRET_KEY = SUPABASE_SECRET_KEYS.default;

if (!SUPABASE_SECRET_KEY) {
  throw new Error("Default Supabase secret key is missing");
}

const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

const vapid: VapidKeys = {
  subject: getRequiredSecret("VAPID_SUBJECT"),

  publicKey: getRequiredSecret("VAPID_PUBLIC_KEY"),

  privateKey: getRequiredSecret("VAPID_PRIVATE_KEY"),
};

// Sends one encrypted Web Push notification to a browser subscription.
async function sendPushNotification(
  subscription: StoredPushSubscription,
  task: DueTask,
): Promise<Response> {
  const pushSubscription: PushSubscription = {
    endpoint: subscription.endpoint,
    expirationTime: null,

    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const payload = await buildPushPayload(
    {
      data: JSON.stringify({
        title: "Ratteb",
        body: task.title,
        url: "/schedule",
      }),

      options: {
        ttl: 60,
      },
    },
    pushSubscription,
    vapid,
  );

  return fetch(subscription.endpoint, payload);
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        {
          error: "Method not allowed",
        },
        {
          status: 405,
        },
      );
    }

    const expectedSecret = Deno.env.get("REMINDER_CRON_SECRET");

    const providedSecret = request.headers.get("x-reminder-secret");

    // Protect the function because it uses privileged database access.
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const now = new Date();

    const windowStart = new Date(
      now.getTime() - REMINDER_WINDOW_MINUTES * 60 * 1000,
    );

    // Only process reminders that became due recently.
    const { data: dueTasks, error: dueTasksError } = await supabaseAdmin
      .from("daily_tasks")
      .select("id,user_id,title,reminder_at")
      .eq("completed", false)
      .is("reminder_sent_at", null)
      .not("reminder_at", "is", null)
      .gte("reminder_at", windowStart.toISOString())
      .lte("reminder_at", now.toISOString())
      .order("reminder_at", {
        ascending: true,
      });

    if (dueTasksError) {
      console.error("Failed to load due reminders:", dueTasksError);

      return Response.json(
        {
          error: "Failed to load due reminders",
        },
        {
          status: 500,
        },
      );
    }

    const tasks = (dueTasks ?? []) as DueTask[];

    let pushesSent = 0;
    let staleSubscriptionsRemoved = 0;
    let failedPushes = 0;

    for (const task of tasks) {
      const { data: subscriptions, error: subscriptionsError } =
        await supabaseAdmin
          .from("push_subscriptions")
          .select("id,endpoint,p256dh,auth")
          .eq("user_id", task.user_id);

      if (subscriptionsError) {
        console.error(
          `Failed to load subscriptions for task ${task.id}:`,
          subscriptionsError,
        );

        failedPushes += 1;

        continue;
      }

      const userSubscriptions = (subscriptions ??
        []) as StoredPushSubscription[];

      let deliveredToAtLeastOneDevice = false;

      for (const subscription of userSubscriptions) {
        try {
          const pushResponse = await sendPushNotification(subscription, task);

          if (pushResponse.ok) {
            pushesSent += 1;

            deliveredToAtLeastOneDevice = true;

            continue;
          }

          // Remove subscriptions that are expired or no longer valid.
          if (pushResponse.status === 404 || pushResponse.status === 410) {
            const { error: deleteError } = await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("id", subscription.id);

            if (deleteError) {
              console.error(
                `Failed to remove stale subscription ${subscription.id}:`,
                deleteError,
              );
            } else {
              staleSubscriptionsRemoved += 1;
            }

            continue;
          }

          console.error(`Push failed with status ${pushResponse.status}`);

          failedPushes += 1;
        } catch (error) {
          console.error(`Push request failed for task ${task.id}:`, error);

          failedPushes += 1;
        }
      }

      if (!deliveredToAtLeastOneDevice) {
        continue;
      }

      // Mark the reminder as sent only after at least one push succeeds.
      const { error: updateError } = await supabaseAdmin
        .from("daily_tasks")
        .update({
          reminder_sent_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .is("reminder_sent_at", null);

      if (updateError) {
        console.error(
          `Failed to mark reminder ${task.id} as sent:`,
          updateError,
        );
      }
    }

    return Response.json({
      checked: tasks.length,
      pushesSent,
      staleSubscriptionsRemoved,
      failedPushes,
    });
  },
};
