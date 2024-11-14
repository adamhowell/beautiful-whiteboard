# Beautiful Whiteboard

A collaborative whiteboard application where users can create, move, and resize boxes in real-time.

You can:
- Create a new box by clicking the "Add box" button
- Select one box by clicking on it, or multiple boxes by holding shift while you click OR by dragging a selection rectangle around multiple boxes
- Move a box by clicking on it and dragging it, move multiple boxes by holding shift while you drag
- Resize a box by clicking on the triangle in the bottom right corner of the box and dragging it
- Copy a box or multiple boxes by selecting it/them and pressing CMD + C on Mac, CTRL + C on Windows
- Paste a box or multiple boxes by selecting it/them and pressing CMD + V on Mac, CTRL + V on Windows
- Delete a box by clicking on it and pressing your delete key
- Deselect a box by clicking off of it or pressing escape
- Open two separate browser instances of the app to see moving, resizing, pasting, and deleting of boxes in real-time

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server (in one terminal):
```
npm run server
```

3. Start the client (in another terminal):
```
npm start
```

The client will run on [http://localhost:3000](http://localhost:3000) and the server on port 3001.

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Author

This project was created by [@adamhowell](https://github.com/adamhowell).
