# TestAppDjango

Развертывание приложения:
1. Склонировать репозиторий.
2. В папке TestAppDjango создать виртуальное окружение: python -m venv test_app_env
3. Активировать виртуальное окружение.
4. Установть зависимости из requirements.txt: pip install -r requirements.txt
5. Перейти в папку frontend и установить зависимости для React: npm install
6. Собрать react: npm run dev
7. Далее выполняем сдедующие команды: 

cd ..
python manage.py collectstatic 
python manage.py runserver

8. Открываем бразер и переходим по адресу: http://127.0.0.1:8000
9. Для работы экспорта таблицы в pdf формате необходимо чтобы на машине стояла программа LibreOffice, проверить можно командой: soffice
