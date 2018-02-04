### Facebook Events

The Upcoming Events section pulls from our church's Facebooks Events. A tiny
microservice hosted on now.sh provides access via the Facebook Graph API.

To deploy, get the Facebook App ID and secret from the Grace Lutheran Church
Facebook app, and run:

    cd events
    now -e FACEBOOK_APP_ID=... -e FACEBOOK_APP_SECRET=... --public
    now alias
