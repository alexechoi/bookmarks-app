# Cloud Scheduler / Cloud Tasks Configuration
#
# Bookmark reminders use Cloud Tasks (one task per bookmark, scheduled at creation time).
# This file sets up the service account and Cloud Tasks queue for those reminders.

# Service account for Cloud Tasks to invoke Cloud Run
resource "google_service_account" "scheduler" {
  provider = google-beta

  project      = google_project.default.project_id
  account_id   = "scheduler-sa"
  display_name = "Cloud Scheduler Service Account"
  description  = "Service account for Cloud Tasks to invoke backend APIs"

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

