import csv
import random
from datetime import datetime, timedelta

# Function to generate sleep data with dates
def generate_sleep_data(start_date, num_entries, period="daily"):
    sleep_data = []

    current_date = start_date

    for _ in range(num_entries):
        # Generate a random total sleep duration (in minutes)
        total_sleep = random.randint(240, 540)  # Random between 240 (4h) and 540 (9h)

        # Generate random percentages for each sleep phase (must add up to 100%)
        while True:
            awake = random.uniform(0, 20)  # Awake phase: 0-20%
            rem = random.uniform(0, 25)    # REM phase: 0-25%
            core = random.uniform(0, 50)   # Core phase: 0-50%
            deep = random.uniform(0, 30)   # Deep phase: 0-30%

            # Normalize percentages to ensure they add up to 100%
            total = awake + rem + core + deep
            awake = (awake / total) * 100
            rem = (rem / total) * 100
            core = (core / total) * 100
            deep = (deep / total) * 100

            if abs(awake + rem + core + deep - 100) < 0.01:  # Allow for floating-point precision
                break

        # Calculate the duration of each phase (in minutes)
        awake_duration = (awake / 100) * total_sleep
        rem_duration = (rem / 100) * total_sleep
        core_duration = (core / 100) * total_sleep
        deep_duration = (deep / 100) * total_sleep

        # Add the sleep data to the list
        sleep_data.append({
            "date": current_date.strftime("%Y-%m-%d"),  # Format date as YYYY-MM-DD
            "total_sleep": total_sleep,  # Total sleep duration (minutes)
            "awake": round(awake_duration, 2),  # Awake phase duration
            "rem": round(rem_duration, 2),      # REM phase duration
            "core": round(core_duration, 2),    # Core phase duration
            "deep": round(deep_duration, 2),    # Deep phase duration
            "awake_pct": round(awake, 2),       # Awake phase percentage
            "rem_pct": round(rem, 2),           # REM phase percentage
            "core_pct": round(core, 2),          # Core phase percentage
            "deep_pct": round(deep, 2),          # Deep phase percentage
        })

        # Increment the date based on the period
        if period == "daily":
            current_date += timedelta(days=1)  # Daily data
        elif period == "weekly":
            current_date += timedelta(weeks=1)  # Weekly data
        elif period == "monthly":
            # Move to the same day next month (handles month boundaries)
            next_month = current_date.month + 1
            next_year = current_date.year
            if next_month > 12:
                next_month = 1
                next_year += 1
            current_date = current_date.replace(year=next_year, month=next_month)

    return sleep_data

# Function to save data to a CSV file
def save_to_csv(data, filename):
    # Define the CSV column headers
    fieldnames = ["date", "total_sleep", "awake", "rem", "core", "deep", "awake_pct", "rem_pct", "core_pct", "deep_pct"]

    # Write data to the CSV file
    with open(filename, mode="w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()  # Write the header row
        writer.writerows(data)  # Write the data rows

# Set the start date and number of entries
start_date = datetime(2023, 1, 1)  # Start date: January 1, 2023
num_entries = 500  # Number of entries (e.g., 7 days for a week, 30 days for a month, etc.)
period = "daily"  # Options: "daily", "weekly", "monthly"

# Generate sleep data
sleep_data = generate_sleep_data(start_date, num_entries, period)

# Print the generated data to the console
print("Generated Sleep Data:")
for entry in sleep_data:
    print(entry)

# Save the data to a CSV file
csv_filename = "dataset/sleep_data.csv"
save_to_csv(sleep_data, csv_filename)
print(f"\nData saved to {csv_filename}")