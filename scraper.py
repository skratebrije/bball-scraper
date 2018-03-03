from bs4 import BeautifulSoup
from 
import requests
import re

def get_values_from_select(select_id, soup):
	select = soup.find("select", id=select_id)
	values = []
	for option in select.find_all("option"):
		values.append(option.get("value"))
	return values

'''
result = requests.get("http://www.wnba.com")
result = requests.get("http://www.wnba.com/schedule/#?month=06&season=2017&seasontype=02")

print(result.status_code)
print(result.headers)

result = requests.get("http://www.wnba.com/schedule/#?month=04&season=2017&seasontype=02")

print(result.status_code)
print(result.headers)

#print(result.content)

soup = BeautifulSoup(result.content, "lxml")

month_values = get_values_from_select("month-filter", soup)
season_values = get_values_from_select("season-filter", soup)

print("months:", month_values)
print("seasons:", season_values)
'''

def get_game_links_for_month_season(month, season):
	url = "http://www.wnba.com/schedule/#?month={m}&season={s}&seasontype=02".format(m=month, s=season)
	result = requests.get(url)
	print(url)
	
	# Only continue if page was received
	if (result.status_code != 200):
		print("Request for {u} failed".format(u=url))
		return []

	def url_matches_game_format(href):
		return href and re.compile("http://www.wnba.com/game/*").search(href)

	soup = BeautifulSoup(result.content, "lxml")
	#for a in soup.find_all("a", href=url_matches_game_format):
	#for a in soup.find_all("a"):
		#print(a.get("href"))

	schedule = soup.find("section", class_="content-wrap schedule")
	print(schedule)

	#print(result.status_code)
	#print(result.headers)

get_game_links_for_month_season("05", "2017")



#print(soup)