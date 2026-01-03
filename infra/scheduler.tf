# Cloud Scheduler Configuration
# Scheduled jobs for bookmark reminders and daily digests

# Service account for Cloud Scheduler to invoke Cloud Run
resource "google_service_account" "scheduler" {
  provider = google-beta

  project      = google_project.default.project_id
  account_id   = "scheduler-sa"
  display_name = "Cloud Scheduler Service Account"
  description  = "Service account for Cloud Scheduler to invoke backend APIs"

  depends_on = [google_project_service.serviceusage]
}

# Grant Cloud Run invoker role to scheduler service account
resource "google_cloud_run_v2_service_iam_member" "scheduler_invoker" {
  provider = google-beta

  project  = google_project.default.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.scheduler.email}"
}

# Cloud Scheduler job to check for due reminders every minute
# This checks for bookmarks whose nextReminderAt has passed
resource "google_cloud_scheduler_job" "check_due_reminders" {
  provider = google-beta

  project   = google_project.default.project_id
  region    = var.region
  name      = "check-due-reminders"
  schedule  = "* * * * *" # Every minute
  time_zone = "UTC"

  description = "Check for bookmarks due for reminder and send notifications"

  retry_config {
    retry_count          = 3
    min_backoff_duration = "5s"
    max_backoff_duration = "60s"
  }

  http_target {
    uri         = "${google_cloud_run_v2_service.backend.uri}/notifications/send-due-reminders"
    http_method = "POST"

    headers = {
      "Content-Type" = "application/json"
    }

    oidc_token {
      service_account_email = google_service_account.scheduler.email
      audience              = google_cloud_run_v2_service.backend.uri
    }
  }

  depends_on = [
    google_project_service.cloudscheduler,
    google_cloud_run_v2_service.backend,
    google_cloud_run_v2_service_iam_member.scheduler_invoker,
  ]
}

# Cloud Scheduler job for daily digest at 9 AM UTC
resource "google_cloud_scheduler_job" "daily_digest" {
  provider = google-beta

  project   = google_project.default.project_id
  region    = var.region
  name      = "daily-digest"
  schedule  = "0 9 * * *" # 9 AM UTC daily
  time_zone = "UTC"

  description = "Send daily digest of unread bookmarks to all users"

  retry_config {
    retry_count          = 3
    min_backoff_duration = "30s"
    max_backoff_duration = "300s"
  }

  http_target {
    uri         = "${google_cloud_run_v2_service.backend.uri}/notifications/send-daily-digest"
    http_method = "POST"

    headers = {
      "Content-Type" = "application/json"
    }

    oidc_token {
      service_account_email = google_service_account.scheduler.email
      audience              = google_cloud_run_v2_service.backend.uri
    }
  }

  depends_on = [
    google_project_service.cloudscheduler,
    google_cloud_run_v2_service.backend,
    google_cloud_run_v2_service_iam_member.scheduler_invoker,
  ]
}

# Cloud Tasks queue for individual bookmark reminders
resource "google_cloud_tasks_queue" "bookmark_reminders" {
  provider = google-beta

  project  = google_project.default.project_id
  location = var.region
  name     = "bookmark-reminders"

  rate_limits {
    max_dispatches_per_second = 10
    max_concurrent_dispatches = 5
  }

  retry_config {
    max_attempts       = 5
    min_backoff        = "1s"
    max_backoff        = "300s"
    max_doublings      = 4
    max_retry_duration = "3600s"
  }

  depends_on = [google_project_service.cloudtasks]
}

# Grant Cloud Tasks enqueue permission to Cloud Run service account
resource "google_project_iam_member" "cloudrun_tasks_enqueuer" {
  provider = google-beta

  project = google_project.default.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Grant Cloud Tasks task creator permission
resource "google_project_iam_member" "cloudrun_tasks_viewer" {
  provider = google-beta

  project = google_project.default.project_id
  role    = "roles/cloudtasks.viewer"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Allow scheduler service account to create OIDC tokens
resource "google_service_account_iam_member" "scheduler_token_creator" {
  provider = google-beta

  service_account_id = google_service_account.scheduler.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.scheduler.email}"
}

# Allow Cloud Run service account to act as scheduler (for Cloud Tasks OIDC)
resource "google_service_account_iam_member" "cloudrun_act_as_scheduler" {
  provider = google-beta

  service_account_id = google_service_account.scheduler.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudrun.email}"
}

