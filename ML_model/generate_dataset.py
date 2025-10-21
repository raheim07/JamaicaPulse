import pandas as pd
import random
import os


os.makedirs(r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model\data", exist_ok=True)

base_examples = [
    # (text, category)
    ("The government must fix the roads.", "Politics & Government"),
    ("Gas prices are rising again, can't afford it.", "Economy & Cost of Living"),
    ("Crime is getting worse in Kingston last night.", "Crime & Safety"),
    ("New dancehall album dropped, it's fire!", "Entertainment & Music"),
    ("Reggae Boyz won the match, proud!", "Sports"),
    ("Water shortage in my area, people suffering.", "Social Issues"),
    # add more diverse seeds per category
    ("Teachers deserve better pay now.", "Social Issues"),
    ("Police need to patrol the neighborhoods more.", "Crime & Safety"),
    ("Inflation has made groceries unaffordable.", "Economy & Cost of Living"),
    ("Politicians promise change but there's no action.", "Politics & Government"),
    ("The concert was amazing, great vibes!", "Entertainment & Music"),
    ("Local football team played well yesterday.", "Sports")
]

# small patois transformations (phrase mapping)
patois_map = [
    ("The government must fix the roads.", "Di govment fi fix di road dem."),
    ("Gas prices are rising again, can't afford it.", "Gas price raise again, cyaan afford nuttin."),
    ("Crime is getting worse in Kingston last night.", "Crime a gwaan worse inna Kingston last night."),
    ("New dancehall album dropped, it's fire!", "New dancehall album drop, pure fire!"),
    ("Reggae Boyz won the match, proud!", "Mi glad fi see di Reggae Boyz win dem match!"),
    ("Water shortage in my area, people suffering.", "Water shortage again, people a suffer."),
    ("Teachers deserve better pay now.", "Di teacher dem deserve better pay fi real."),
    ("Police need to patrol the neighborhoods more.", "Di police dem need fi patrol more inna di area."),
    ("Inflation has made groceries unaffordable.", "Inflation mash up wi, grocery price sky high."),
    ("Politicians promise change but there's no action.", "Government a promise but nutten nah change."),
    ("The concert was amazing, great vibes!", "Di concert did wicked, vibes tun up!"),
    ("Local football team played well yesterday.", "Di football team play good yesterday!")
]

#Add both base and patois mapped lines
rows = []
for (text, cat) in base_examples:
    rows.append((text, cat))
    

for(eng, pat) in patois_map:
    #find matching category from base_examples
    cat = None
    for(t,c) in base_examples:
        if t == eng:
            cat = c
            break
    if cat:
        rows.append

#Duplicate and shuffle to get to 600 examples (for ML model)
multiplier = 40  # 12 unique * 40 = 480
expanded = rows * multiplier
random.shuffle(expanded)

df = pd.DataFrame(expanded, columns = ["text", "category"])
df.to_csv(r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model\data/jamaica_posts_labeled.csv", index=False)
print("Saved Data/jamaica_posts_labled.csv with", len(df), "rows")
