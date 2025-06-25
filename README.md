# 🚜🌱 Artisanal Producers & Farmers API 🌱🚜  

A simple API to fetch and lookup data about artisanal producers and farmers from [Fraise et Local](https://www.fraisetlocal.fr/) (French platform).  

## 📦 Features  

- **Data Fetching**:  
  - [📥](#) `fetch_records.py` or `fetchAndProcessRecords.ts` - Scripts to download all producer data from the API  
  - � Deduplication & filtering (removes `null` values and unwanted fields)  

- **API Lookup**:  
  - [🔍](#) `/lookup?url=URL_ENCODED` - Find producers by their partner platform URL  
  - 🏠 Runs locally (`192.168.0.51:3000` by default)  

## 🛠️ Setup  

1. **Fetch Data** (Choose one):  
   ```sh
   python fetch_records.py  
   # OR  
   ts-node fetchAndProcessRecords.ts  
   ```  
   *(Output: `all_fraisetlocal_records.json`)*  

2. **Run API Server**:  
   ```sh
   ts-node server.ts  
   ```  

3. **Query Producers**:  
   ```sh
   curl "http://192.168.0.51:3000/lookup?url=URL_ENCODED"  
   ```  

## 🌍 Example Use Cases  

- 🛒 **Local Shopping Apps** – Find nearby farmers  
- 📊 **Market Research** – Analyze artisanal producer data  
- 🗺️ **Interactive Maps** – Plot producers by location  

## 📂 JSON Data Structure  

```json
[
  {
    "nom_de_la_plateforme": "...",
    "nom_du_producteur": "...",
    "url_sur_la_plateforme_partenaire": "...",
    "produits": ["...", "..."],
    "geoloc": { "lat": XX.XXXX, "lon": XX.XXXX },
    "ville": "..."
  },
  ...
]
```

## ⚠️ Note  
- Replace `192.168.0.51` with your machine’s local IP if needed.  
- Data is filtered to exclude `reg_code`, `adress_app`, and `url_du_logo`.  

---  
🔗 *Built with Node.js | Python | OpenDataSoft API*
