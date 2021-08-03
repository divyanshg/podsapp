- Includes features like :
    1. Create channels
    2. Get all channels
    3. Get particular channel
    4. add subscribers
    5. get subscriber count
    6. update channel details

- Routes
    1. /all/:page/:per_page - GET
    2. /:id(channel-id) - GET
    3. /u/my - GET
    4. /new - POST
    5. /subscribe/:id(channel-id) - PUT
    6. /update/:id(channel-id) - PATCH - BODY {fieldtoupdate: updatewith}
    7. /subscribers/count/:id(channel-id) - GET
