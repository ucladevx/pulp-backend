import json

with open('colleges.json') as f:
	data = json.load(f)

list_of_colleges = []

for college in data:
	if college["country"] != "United States":
		continue
	list_of_colleges.append(college["name"])

list_of_colleges.sort()

college_list = []
for college in list_of_colleges:
	new_college = {}
	new_college["name"] = college
	college_list.append(new_college)

