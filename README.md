Node.js chat room
=================

To serve chat room locally run `node index.js` and open browser on http://localhost:5000.

## App structure

1. index.js -  сервер, который слушает запросы юзера и парсит URLки для получения pathname, в зависимости от запроса, 
посылает запросы в router, где они обрабатываются. Также сервер отвечает 
за аутентификацию юзера в чем ему помогает middleware.
2. Routes - получает запросы от сервера, парсит URLки для получения параметров и совершает определенные манипуляции (добавляет HTTP заголовки, читает с диска, общается со Storage, взаимодействует с Manager и Message) в зависимости от запроса. 
3. Middleware - получает обьекты запроса и ответа, преобразовывает их (аутентификации юзера). Получает или создает кукис и добавляет его в Storage.
4. Storage - принимает запросы от middleware, routes и manager. Хранит данные для работы программы в оперативной памяти. Добавляет / удаляет user, room, sessions и тд. Взаимодействует с Loader для записи и чтения из долговременной памяти (sessions.json, users.js).
5. Loader - На прямую работает с диском или БД, для сохранения данных в долговременную память (получает запросы от Storage на запись, либо чтение информации о sessions, users, и тд.).
6. Manager - выполняет основную обработку запросов в роутах. Взаимодействует со Storage для добавления/удаления rooms, users, etc. 
7. User - ...
8. Message - ...
9. Room - ...
10. sessions.json, users.js - долговременное хранилище. 

## Send message flow

```
Client (send message)
10.↑↓1.
Server (index.js)
9.↑↓2.
Middleware
8.↑↓3.
Router
7.↑↓4.
Manager
6.↑↓5.
Storage
↑↓
Loader
↑↓
messages.json
```
