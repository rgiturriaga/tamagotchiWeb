from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)

    async def send_pet_update(self, user_id: int, data: dict):
        if user_id not in self.active_connections:
            return
        dead_sockets: Set[WebSocket] = set()
        for ws in self.active_connections[user_id]:
            try:
                await ws.send_json(data)
            except Exception:
                dead_sockets.add(ws)
        self.active_connections[user_id] -= dead_sockets


manager = ConnectionManager()
