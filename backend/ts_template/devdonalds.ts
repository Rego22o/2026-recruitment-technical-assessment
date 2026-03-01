import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  // TODO: implement me
      if (!recipeName || recipeName.length === 0) {
        return null;
    }

    // Hyphens and underscores get replaced with spaces
    let processed = recipeName.replace(/[-_]/g, ' ');
    
    // Remove everything that isn't a letter or a space
    processed = processed.replace(/[^a-zA-Z\s]/g, '');
    
    // Get an array of words and filter out empty words
    const words = processed.split(/\s+/).filter(word => word.length > 0);
    
    // Return null if there are no words (e.g. input was #$%@!)
    if (words.length === 0) {
        return null;
    }
    
    // Capitalize the first letter of each word and turn the others to lowercase
    const capitalizedWords = words.map(word => {
        if (word.length === 1) {
            return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    // Join back the words with a single space in between
    const result = capitalizedWords.join(' ');
    
    // If the input already satisfies all conditions, return the original
    if (recipeName === result) {
        return recipeName; 
    }
    
    return result;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  // TODO: implement me
  const data = req.body;
  if (!data || !data.type || !data.name) {
    res.status(400).json({error: 'Fields missing'});
    return;
  }

  // 'type' field check 
  if (data.type !== 'recipe' && data.type !== 'ingredient') {
    res.status(400).json({error: 'Type must be either Ingredient or Recipe'});
    return;
  }

  // unique entry name check
  for (let i of cookbook) {
    if (i.name == data.name) {
      res.status(400).json({error: 'entries must have a unique name'});
      return;
    }
  }
  // check if the cooktime for the ingredient is >= 0
  if (data.type === 'ingredient') {
    if (data.cookTime < 0) {
      res.status(400).json({error: "cookTime must be greater than or equal to 0"})
      return;
    }
  }

  // check if the requiredItems have unique names if entry is a recipe
  if (data.type === 'recipe') {
    if (!data.requiredItems) {
      res.status(400).json({error: 'Fields missing'});
      return;
    }
    for (let i in data.requiredItems) {
      let currentItemName = data.requiredItems[i].name;
      for (let j in data.requiredItems) {
        if (data.requiredItems[j].name === currentItemName && i != j) {
          res.status(400).json({error: 'requiredItem names must be unique'});
          return;
        }
      }
    }
  }
  cookbook.push(data);
  res.status(200).send();
  return;
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Response) => {
  const recipeName = req.query.name as string;
  if (!recipeName) {
    return res.status(400).send();
  }

  const entry = cookbook.find((e: any) => e.name === recipeName);

  // check if entry exists and is of type recipe
  if (!entry) {
    return res.status(400).send();
  } 
  if (entry.type !== 'recipe') {
    return res.status(400).send();
  }

  // create the map for the ingredients and the variabel to store the total cook time
  const ingredientsMap = new Map<string, number>();
  let totalCookTime = 0;

  function processItem(itemName: string, quantityMultiplier: number) {
    const item = cookbook.find((e: any) => e.name === itemName) 
    if (!item) {
      throw new Error('not found');
    }

    // Get the current quantity of the ingredient in the map, and add the quantity to it
    if (item.type === 'ingredient') {
      const currentQuantity = ingredientsMap.get(itemName) || 0;
      ingredientsMap.set(itemName, currentQuantity + quantityMultiplier)

      totalCookTime += quantityMultiplier * item.cookTime;

    } else {
      // recurse if it is another recipe, multiplying it by the quantity to keep the value accurate
      for (const requiredItem of item.requiredItems) {
        processItem(requiredItem.name, requiredItem.quantity * quantityMultiplier);
      }

    }
  }

  try {
    for (const requiredItem of entry.requiredItems) {
      // process the first layer of required items
      processItem(requiredItem.name, requiredItem.quantity);
    }
  } catch (error) {
    return res.status(400).send();
  }

  const ingredients = Array.from(ingredientsMap.entries()).map(([name, quantity]) => ({
    name, 
    quantity
  }))
  res.json({
    name: recipeName,
    cookTime: totalCookTime,
    ingredients,
  })

});



// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
