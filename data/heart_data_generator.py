import csv
import datetime
import random

def generate_heart_rate_data(output_file):
  """
  Generates heart rate data every 5 minutes for 30 days and writes to a CSV.

  :param output_file: The name/path of the CSV file to create.
  """
  # Define the start date and time (adjust as needed)
  start_date = datetime.datetime(2023, 1, 1, 0, 0)
  
  # Number of days to generate
  days = 30
  
  # Number of minutes per day
  minutes_per_day = 24 * 60  # 1440 minutes
  
  # Open (or create) the CSV file for writing
  with open(output_file, 'w', newline='') as f:
    writer = csv.writer(f)
    
    # Write the header row
    writer.writerow(["timestamp", "heart_rate"])
    
    # Generate data for each day and every 5-minute interval
    for day in range(days):
      for minute in range(0, minutes_per_day, 5):  # step by 5 minutes
        current_time = start_date + datetime.timedelta(days=day, minutes=minute)
        
        # Generate a random heart rate between 60 and 100
        heart_rate = random.randint(60, 100)
        
        # Write a row with the timestamp (YYYY-MM-DD HH:MM) and heart rate
        writer.writerow([
            current_time.strftime("%Y-%m-%d %H:%M"),
            heart_rate
        ])

if __name__ == "__main__":
  # Call the function to generate the CSV
  generate_heart_rate_data("my-health-app/public/data/heart_rate_data.csv")