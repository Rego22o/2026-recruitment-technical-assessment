from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
	name: str

@dataclass
class RequiredItem():
	name: str
	quantity: int

@dataclass
class Recipe(CookbookEntry):
	required_items: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
	cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = None

# Task 1 helper (don't touch)
@app.route("/parse", methods=['POST'])
def parse():
	data = request.get_json()
	recipe_name = data.get('input', '')
	parsed_name = parse_handwriting(recipe_name)
	if parsed_name is None:
		return 'Invalid recipe name', 400
	return jsonify({'msg': parsed_name}), 200

# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that 
def parse_handwriting(recipeName: str) -> Union[str | None]:
	# TODO: implement me
	if not recipeName or len(recipeName) == 0:
		return None
	processed = re.sub(r'[-_]', ' ', recipeName)
	processed = re.sub(r'[^a-zA-Z\s]', '', processed)
	words = [word for word in re.split(r'\s+', processed) if len(word) > 0]

	if len(words) == 0:
		return None
		
	capitalized_words = []
	for word in words:
		if len(word) == 1:
			capitalized_words.append(word.upper())
		else:
			capitalized_words.append(word[0].upper() + word[1:].lower())

	result = ' '.join(capitalized_words)

	if recipeName == result:
		return recipeName

	return result


# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route('/entry', methods=['POST'])
def create_entry():
	# TODO: implement me
	# I am not really familiar with routes in python so I won't bother with this but I am a fast learner (trust me bro)
	return 'not implemented', 500


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
	# TODO: implement me
	# I am not really familiar with routes in python so I won't bother with this but I am a fast learner (trust me bro)
	return 'not implemented', 500


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
	app.run(debug=True, port=8080)
