# 1. Scale the scraper to hundreds of thousands of listings:
I would split each city to small chunks so I get below the exposed properties which are ~1050 for each search query, for london there are more than 177k properties, but I'm only allowed to query 1050. 

# 2. Track price changes over time. 
A lot of ways to do that some of them: 1. We could add a view price button that makes a request to the property and extract the price: changed? -> update price, same? -> show the current price. 2. We could make the price an object/dictionary in the schema, add lastChecked that allow us to check the price/update it every 1 day for example which is not so good performance wise. 

# 3. Detect if the scraper has silently stopped working.
I would add a flag in the dashboard or the system that handles these scraped properties. Which says when's the last time it scraped a property -> if over a certain amount of time, show a warning and stop the scraper. Send an email/sms based on the available tools. 

# 4. Identify silent data-quality issues.
I would run a check every 1000 property for their schema and any quality issues. identify the bad ones, check them manually from the scraped source and include that as a use case in my script. show a warning in the dashboard/system + alert the team by sending an email/sms based on the avaialbe tools. 

# 5. Monitor extraction accuracy. 
I would log the resultCount and the scrapedCount if the scrapedCount is less than the resultCount significantly. stop, and show a warning in the dashboard/system, alert the team by sending an email/sms based on the avaialbe tools. 

# 6. Alert the team when something breaks. 
I would have warnings with colors based on the urgency of the error, for example RED indicates a major issue in the flow and requires immediate attention. YELLOW can be for low priority issues such as some data-quality issues, if it's below the allowed percentage. These warnings would appear on the system/dashboard and it'll be sent via email/sms to the team. 