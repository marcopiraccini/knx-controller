# knx-controller
knx-controller module (based on node-eibd).

Tested using node v4.1.1 on a Raspberry PI 2

The goal of this module are:
- Create a consistent log for all the KNX events
- Interact with an event-store
- Expose a layer of HTTP API (http://localhost:4000) to interact with the Controller
- Expose a socket.io socket for managing the events from the bus.
- Init software KNX Components

TODO: Add documentation.
