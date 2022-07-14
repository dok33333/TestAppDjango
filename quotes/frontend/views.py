import os
import json
import httpx
import asyncio
import requests
import xlsxwriter
import pandas as pd
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime



def index(request):
    return render(request, 'index/index.html')


def create_XLSX(data):
    path = 'media/temp/'
    if not os.path.exists(path): assert os.makedirs(path)
    name_file = path + "report.xlsx"
    name_worksheet_report = ('Report')
    workbook = xlsxwriter.Workbook(name_file)
    worksheet = workbook.add_worksheet(name_worksheet_report)
    format1 = workbook.add_format(
                {'align': 'center', 'valign': 'vcenter', 'bold': True, 'font_name': 'Times New Roman',
                 'text_wrap': True})
    format2 = workbook.add_format(
                {'align': 'left', 'valign': 'vcenter', 'border': 1, 'font_name': 'Times New Roman',
                 'text_wrap': True})
    format3 = workbook.add_format(
                {'align': 'left', 'valign': 'vcenter', 'bold': True, 'border': 1, 'font_name': 'Times New Roman',
                 'text_wrap': True})
    
    worksheet.set_column('A:A', 15)
    worksheet.set_column('B:B', 20)
    worksheet.set_column('C:C', 14)
    worksheet.set_column('D:D', 17)
    worksheet.set_column('E:E', 10)

    index = 1
    worksheet.merge_range('A' + str(index) + ':' + 'E' + str(index),
                                  "Котировки криптовалют",
                                  format1)
    index += 1
    worksheet.write('A' + str(index), "Код валюты", format3)
    worksheet.write('B' + str(index), "Название валюты", format3)
    worksheet.write('C' + str(index), "Цена", format3)
    worksheet.write('D' + str(index), "Дата котировки", format3)
    worksheet.write('E' + str(index), "Номинал", format3)
    index += 1
    for item in data:
        worksheet.write('A' + str(index), item['symbol'], format2)
        worksheet.write('B' + str(index), item['name'], format2)
        worksheet.write('C' + str(index), item['price'], format2)
        worksheet.write('D' + str(index), item['date'], format2)
        worksheet.write('E' + str(index), item['nom'], format2)
        index +=1

    workbook.close()

    return name_file


async def get_tasks(cryptocurrencies):
    items = [[cryptocurrencie, f"https://api-pub.bitfinex.com/v2/stats1/vwap:1d:t{cryptocurrencie[0] + 'USD'}/hist?limit=1"] for cryptocurrencie in cryptocurrencies]
    tasks = [get_quotes_async(item[0], item[1]) for item in items]
    return await asyncio.gather(*tasks)


async def get_quotes_async(cryptocurrencie, url):
    res = {
        'symbol': cryptocurrencie[0],
        'name': cryptocurrencie[1],
        'price': 0,
        'date': "-",
        'nom': "-"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5)
            if response.status_code == 200:
                if (len(response.json()) > 0):
                    res['date'] = response.json()[0][0]
                    res['price'] = response.json()[0][1]
                    res['nom'] = 1
        except Exception as ex:
            print(ex)

    if res['price'] == 0:
        res['price'] = "-"
    if res['date'] != "-":
        res['date'] = datetime.fromtimestamp(int(str(res['date'])[:-3])).strftime("%d.%m.%Y, %H:%M")
    
    return res


def get_pair(request):
    if request.method == 'GET':
        res = requests.get("https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange")
        return JsonResponse(status=200, data=res.json(), safe=False)


def get_cryptocurrencies(request):
    if request.method == 'GET':
        res = requests.get("https://api-pub.bitfinex.com/v2/conf/pub:map:currency:label") # list:currency
        return JsonResponse(status=200, data=res.json(), safe=False)


@csrf_exempt
def get_quotes(request):
    if request.method == 'POST':
        request_body = json.loads(request.body)
        res = None
        async def main_1():
            result = await get_tasks(request_body['cryptocurrencies'])
            return result
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop = asyncio.get_event_loop()
        res = loop.run_until_complete(main_1())
        loop.close()
        return JsonResponse(status=200, data=res, safe=False)


@csrf_exempt
def export(request):
    if request.method == 'POST':
        request_body = json.loads(request.body)
        format = request_body['format']
        data = request_body['data']
        res = {
            'file': None
        }
        file_name = create_XLSX(data)
        res['file'] = file_name
        
        if format == "CSV":
            csv_file_name = file_name.replace('xlsx', 'csv')
            read_file = pd.read_excel(file_name)
            read_file.to_csv (csv_file_name, index = None, header=True)
            res['file'] = csv_file_name
        if format == "PDF":
            pdf_file_name = file_name.replace('xlsx', 'pdf')
            path = os.getcwd() + '\\media\\temp'
            cmd_line = f"cd {path} & soffice --convert-to pdf report.xlsx"
            res_conv = os.system(cmd_line)
            if res_conv == 0:
                print("Report conversion xlsx in pdf successfully!")
            else:
                print("Error conversion_xlsx_pdf!")

            res['file'] = pdf_file_name

        return JsonResponse(status=200, data=res, safe=False)