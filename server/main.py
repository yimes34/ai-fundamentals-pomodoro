from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

subjects = []
sessions = []


@app.route("/subjects")
def get_subjects():
  return jsonify(subjects)

@app.route("/subjects", methods=["POST"])
def add_subjects():
  data = request.get_json()
  max_id = 0
  for subject in subjects:
    if max_id < subject["id"]:
      max_id = subject["id"]
  data["id"] = max_id + 1
  subjects.append(data)
  return jsonify(data)

@app.route("/subjects/<int:id>", methods=["DELETE"])
def delete_subject(id):
  global subjects
  new_subjects = []
  for subject in subjects:
    if subject["id"] != id:
      new_subjects.append(subject)
  subjects = new_subjects
  return jsonify({"success": True})

@app.route("/sessions")
def get_sessions():
  subject_id = request.args.get("subject_id", type=int)
  date_range = request.args.get("range", "all")

  today = datetime.now()
  month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
  week_start = today - timedelta(days=today.weekday())
  week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

  filtered_sessions = sessions

  if subject_id is not None:
    new_filtered_sessions = []
    for session in filtered_sessions:
      if session["subject_id"] == subject_id:
        new_filtered_sessions.append(session)
    filtered_sessions = new_filtered_sessions

  if date_range == "week":
    new_filtered_sessions = []
    for session in filtered_sessions:
      session_date = datetime.fromisoformat(session["created_at"])
      if session_date >= week_start:
        new_filtered_sessions.append(session)
    filtered_sessions = new_filtered_sessions
  elif date_range == "month":
    new_filtered_sessions = []
    for session in filtered_sessions:
      session_date = datetime.fromisoformat(session["created_at"])
      if session_date >= month_start:
        new_filtered_sessions.append(session)
    filtered_sessions = new_filtered_sessions

  return jsonify(filtered_sessions)

@app.route("/statistics")
def get_statistics():
  today = datetime.now().date()

  total_minutes = 0
  for session in sessions:
    total_minutes += session["duration"]

  week_start = today - timedelta(days=today.weekday())

  weekly_sessions = 0
  for session in sessions:
    session_date = datetime.fromisoformat(session["created_at"]).date()
    if session_date >= week_start:
      weekly_sessions += 1

  subject_totals = {}
  for session in sessions:
    subject_name = session.get("subject_name", "Unknown subject")

    if subject_name not in subject_totals:
      subject_totals[subject_name] = 0

    subject_totals[subject_name] += session["duration"]

  subject_breakdown = []
  for subject_name, minutes in subject_totals.items():
    subject_breakdown.append({
      "subject": subject_name,
      "minutes": minutes,
    })

  day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  weekly_pattern = []

  for day_name in day_names:
    weekly_pattern.append({
      "day": day_name,
      "minutes": 0,
    })

  for session in sessions:
    session_date = datetime.fromisoformat(session["created_at"])
    day_index = session_date.weekday()
    weekly_pattern[day_index]["minutes"] += session["duration"]

  session_days = set()
  for session in sessions:
    session_days.add(datetime.fromisoformat(session["created_at"]).date())

  streak = 0

  if today in session_days:
    current_day = today
  else:
    current_day = today - timedelta(days=1)

  while current_day in session_days:
    streak += 1
    current_day -= timedelta(days=1)

  return jsonify({
    "streak": streak,
    "total_minutes": round(total_minutes, 2),
    "weekly_sessions": weekly_sessions,
    "subject_breakdown": subject_breakdown,
    "weekly_pattern": weekly_pattern,
  })

@app.route("/sessions", methods=["POST"])
def post_sessions():
  data = request.get_json()
  subject_id = data["subject_id"]
  duration = data["duration"]

  subject_name = "Unknown subject"
  for subject in subjects:
    if subject["id"] == subject_id:
      subject_name = subject["name"]

  max_id = 0
  for session in sessions:
    if max_id < session["id"]:
      max_id = session["id"]
  data["id"] = max_id + 1
  data["subject_name"] = subject_name

  data["created_at"] = datetime.now().isoformat()

  sessions.append(data)

  return jsonify(data)

@app.route("/sessions/<int:id>", methods=["DELETE"])
def delete_session(id):
  global sessions
  new_sessions = []
  for session in sessions:
    if session["id"] != id:
      new_sessions.append(session)
  sessions = new_sessions
  return jsonify({"success": True})

if __name__ == "__main__":
  app.run()