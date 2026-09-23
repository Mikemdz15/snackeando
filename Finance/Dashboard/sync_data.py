import urllib.request
import csv
import json
import os
import re

# Spreadsheet ID
sheet_id = "12A-X7sKhJcEBP_sZ7Ij9D6AV1j-YWVd2z4Cix-PgVT4"

# URLs for CSV exports
url_prod = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid=0"
url_cash = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid=1226302399"

def parse_date(date_str):
    if not date_str:
        return ""
    if "-" in date_str:
        return date_str
    parts = date_str.split("/")
    if len(parts) == 3:
        day = parts[0].zfill(2)
        month = parts[1].zfill(2)
        year = parts[2]
        return f"{year}-{month}-{day}"
    return date_str

def parse_float(val):
    if not val:
        return 0.0
    val_clean = val.replace("$", "").replace(",", "").strip()
    try:
        return float(val_clean)
    except:
        return 0.0

def fetch_csv(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
    return content

SKU_ALIAS = {
    'VOREOVAI63': 'VGALOREVAI63',
    'OREOVAI63': 'VGALOREVAI63',
    'GALOREVAI63': 'VGALOREVAI63'
}

CANONICAL_NAMES = {
    'VDUC00080': 'GOMITAS MANGUITOS 12x96g (NUEVO)',
    'VDUC00081': 'GOMITAS OSITOS 12x100g (NUEVO)',
    'V5000000182': 'Boing Lata Guayaba 1/24/340',
    'V5000000402': 'Boing Lata Mango 1/24/340',
    'VSABADOB57': 'Papas fritas Sabritas adobadas 57 g',
    'VSABORIG42': 'Pack Sabritas 1/5/10/40g',
    'VGALOREVAI63': 'OREO CHOCOVAINILLA 1/12/4 63 grs',
    'VCOCAORI600': 'Coca Cola 1/24/600 ml',
    'VCOCAORI335': 'Coca Cola 1/12/355 ml',
    'VDUF00093': 'KINDER DELICE 10 X 14 X 40G',
    'VDUF00092': 'B-READY NUTELLA 10 X 4 X 22G',
    'VDORNACH61': 'Pack Doritos 1/5/10/54g',
    'VAB00009': 'SOPA INSTANTANEA MARUCHAN CAMARON HABANERO 64 GR',
    'VAB00010': 'SOPA INSTANTANEA MARUCHAN CAMARON PIQUIN 64 GR',
    'VCONM&M37.5': 'MMS Cacahuate 37gpz/ cj.1/32/6/37.5g',
    'VGALTRIKI51': 'Caja Triki Trakes 1/26/51g',
    'VCHETOS46': 'Botana Cheetos Torciditos Chico 46g',
    'VGALPRIN42': 'PRINCIPE 1/16/63 GRS',
    'VDUR00053': 'BUBULUBU CAJA 12P 35G MAY RIC',
    'VRANCHER40': 'Pack Rancheritos 1/5/10/40g',
    'VGALROCK44': 'Rocko 4/44g',
    'VDUM00039': 'MEGA BUBBALOO FRESA 39 GRS',
    'VDUH00038': 'PELONETES TMRND DSPL 8/18/30G',
    'VMAMUT30': 'GMSMAMUT 30 GRS',
    'VDUM00046': 'TRIDENT XTRACARE MENTA 13.6GR',
    'VGALPRIRE42': 'Prrincipe/ Reese 1/12/9/42g',
    'VDUM00051': 'HALLS MENTA FOP 30X12X25.2G',
    'VDURP0078': 'PALETA PAYASO CJ 10P 43.5G (NUEVO)',
    'VDUM00034': 'SKW SSGT SAN GDA 20/12/24G MX'
}

def get_canonical_sku(raw_sku):
    if not raw_sku:
        return ''
    s = str(raw_sku).strip().upper()
    if not s.startswith('V') and ('V' + s) in CANONICAL_NAMES:
        s = 'V' + s
    if s in SKU_ALIAS:
        s = SKU_ALIAS[s]
    return s

def main():
    print("Sincronizando datos del Dashboard desde Google Sheets...")
    
    try:
        # 1. Fetch data
        csv_prod_text = fetch_csv(url_prod)
        csv_cash_text = fetch_csv(url_cash)
        
        # 2. Parse Products CSV (gid: 0)
        prod_reader = csv.reader(csv_prod_text.splitlines())
        header_prod = next(prod_reader)
        data_prod = list(prod_reader)
        
        products_map = {}
        
        for row in data_prod:
            if len(row) < 7 or not row[0]:
                continue
            raw_sku = row[3]
            raw_name = row[4]
            units = int(row[5] or 0)
            amount = parse_float(row[6])
            unit_cost = parse_float(row[7]) if len(row) > 7 else 0.0
            total_cost = parse_float(row[8]) if len(row) > 8 else (units * unit_cost)
            
            if not raw_name or raw_name == "None" or raw_name == "null" or raw_name == "":
                continue
                
            canonical_sku = get_canonical_sku(raw_sku)
            if not canonical_sku:
                canonical_sku = raw_sku.strip().upper()
            canonical_name = CANONICAL_NAMES.get(canonical_sku, raw_name.strip())

            if canonical_sku not in products_map:
                products_map[canonical_sku] = {
                    "sku": canonical_sku,
                    "name": canonical_name,
                    "units": 0,
                    "revenue": 0.0,
                    "cost": 0.0
                }

            products_map[canonical_sku]["units"] += units
            products_map[canonical_sku]["revenue"] += amount
            products_map[canonical_sku]["cost"] += total_cost
            
        prod_list = []
        tot_prod_rev = sum(p["revenue"] for p in products_map.values())
        tot_prod_cost = sum(p["cost"] for p in products_map.values())
        tot_prod_profit = tot_prod_rev - tot_prod_cost
        overall_profit_margin = (tot_prod_profit / tot_prod_rev) if tot_prod_rev > 0 else 0.0

        for sku, p in products_map.items():
            rev = p["revenue"]
            cst = p["cost"]
            pft = rev - cst
            margin = (pft / rev) if rev > 0 else 0.0
            u = p["units"]
            u_cost = (cst / u) if u > 0 else 0.0
            prod_list.append({
                "sku": sku,
                "name": p["name"],
                "units": u,
                "revenue": rev,
                "cost": cst,
                "unitCost": u_cost,
                "profit": pft,
                "profitMargin": margin
            })
            
        # Sort top 10 and bottom 5
        top_products = sorted(prod_list, key=lambda x: x["revenue"], reverse=True)[:10]
        bottom_products = sorted([x for x in prod_list if x["units"] > 0], key=lambda x: x["units"])[:5]
        
        # 3. Parse Cash/Card CSV (gid: 1226302399)
        cash_reader = csv.reader(csv_cash_text.splitlines())
        header_cash = next(cash_reader)
        data_cash = list(cash_reader)
        
        daily_map = {}
        total_sales = 0
        total_units = 0
        cash_sales = 0
        card_sales = 0
        
        machines = {}
        
        for row in data_cash:
            if len(row) < 11 or not row[0]:
                continue
            date_str = parse_date(row[0])
            machine = row[1]
            card_units = int(row[5] or 0)
            card_amt = parse_float(row[6])
            cash_units = int(row[7] or 0)
            cash_amt = parse_float(row[8])
            tot_units = int(row[9] or 0)
            tot_amt = parse_float(row[10])
            
            total_sales += tot_amt
            total_units += tot_units
            cash_sales += cash_amt
            card_sales += card_amt
            
            # Dynamic initialization for new/future machines
            if machine not in machines:
                machines[machine] = {
                    "id": machine,
                    "name": "Planta Baja - Oficinas" if machine == "IB0009" else ("Área de Producción - Planta" if machine == "IB0010" else f"Máquina {machine}"),
                    "place": row[3] if len(row) > 3 else "N/A",
                    "location": row[2] if len(row) > 2 else "N/A",
                    "type": row[4] if len(row) > 4 else "N/A",
                    "cashSales": 0.0, "cardSales": 0.0, "totalSales": 0.0,
                    "cashUnits": 0, "cardUnits": 0, "totalUnits": 0,
                    "startDate": None, "_startCompareDate": None
                }
                
            machines[machine]["cashSales"] += cash_amt
            machines[machine]["cardSales"] += card_amt
            machines[machine]["totalSales"] += tot_amt
            machines[machine]["cashUnits"] += cash_units
            machines[machine]["cardUnits"] += card_units
            machines[machine]["totalUnits"] += tot_units
            
            # Determine start date (earliest date with sales > 0)
            if tot_amt > 0 or tot_units > 0:
                original_date = row[0]  # format e.g. "30/07/2026"
                if not machines[machine]["startDate"] or date_str < machines[machine]["_startCompareDate"]:
                    machines[machine]["_startCompareDate"] = date_str
                    machines[machine]["startDate"] = original_date
                
            if date_str not in daily_map:
                daily_map[date_str] = {
                    "date": date_str,
                    "total_sales": 0.0, "total_units": 0
                }
                
            # Dynamic cash/card/units mapping
            daily_map[date_str][f"{machine}_cash"] = daily_map[date_str].get(f"{machine}_cash", 0.0) + cash_amt
            daily_map[date_str][f"{machine}_card"] = daily_map[date_str].get(f"{machine}_card", 0.0) + card_amt
            daily_map[date_str][f"{machine}_units"] = daily_map[date_str].get(f"{machine}_units", 0) + tot_units
                
            daily_map[date_str]["total_sales"] += tot_amt
            daily_map[date_str]["total_units"] += tot_units
            
        sorted_dates = sorted(daily_map.keys())
        discovered_machines = list(machines.keys())
        
        # Ensure all day objects have records for all discovered machines
        daily_sales_list = []
        for d in sorted_dates:
            day_obj = daily_map[d]
            for m in discovered_machines:
                if f"{m}_cash" not in day_obj: day_obj[f"{m}_cash"] = 0.0
                if f"{m}_card" not in day_obj: day_obj[f"{m}_card"] = 0.0
                if f"{m}_units" not in day_obj: day_obj[f"{m}_units"] = 0
            daily_sales_list.append(day_obj)
            
        # Clean up temporary comparison keys
        for m in machines:
            if "_startCompareDate" in machines[m]:
                del machines[m]["_startCompareDate"]
        
        # 4. Consolidate into output JSON
        output_data = {
            "dateRange": {
                "start": sorted_dates[0] if sorted_dates else "",
                "end": sorted_dates[-1] if sorted_dates else ""
            },
            "summary": {
                "totalSales": total_sales,
                "totalUnits": total_units,
                "cashSales": cash_sales,
                "cardSales": card_sales,
                "totalCost": tot_prod_cost,
                "totalProfit": tot_prod_profit,
                "profitMargin": overall_profit_margin,
                "estimatedProfit": tot_prod_profit
            },
            "machines": machines,
            "dailySales": daily_sales_list,
            "topProducts": top_products,
            "bottomProducts": bottom_products,
            "allProducts": prod_list
        }
        
        output_js = f"""// Base de datos estática consolidada (DEX y Efectivo - Snackeando)
const SNACKEANDO_RAW_DATA = {json.dumps(output_data, indent=4)};
"""
        
        # Save to file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        dest_path = os.path.join(script_dir, "sales_data.js")
        
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(output_js)
            
        print(f"¡Sincronización Exitosa! {dest_path} actualizado.")
        print(f"Rango de Fechas: {output_data['dateRange']['start']} a {output_data['dateRange']['end']}")
        print(f"Ventas Totales: ${output_data['summary']['totalSales']:,.2f}")
        print(f"Unidades Totales: {output_data['summary']['totalUnits']}")
        for m in machines:
            print(f"Máquina: {m} | Nombre: {machines[m]['name']} | Fecha Arranque: {machines[m]['startDate']}")
        
    except Exception as e:
        print("Error durante la sincronización:", e)

if __name__ == "__main__":
    main()
