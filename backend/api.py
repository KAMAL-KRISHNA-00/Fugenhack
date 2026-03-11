from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import string

from supabase_client import SupabasePairingClient

app = FastAPI()

supabase_client = SupabasePairingClient()


# Models
class DeviceRegisterRequest(BaseModel):
    device_id: str
    device_name: str
    os: str


class DevicePairRequest(BaseModel):
    device_id: str
    user_id: str


def generate_pair_token(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


@app.post("/device/register")
def register_device(req: DeviceRegisterRequest):

    if not supabase_client.enabled:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    # check if device already exists
    existing = supabase_client.fetch_device_pairing(req.device_id)

    if existing:
        return {
            "message": "Device already registered",
            "device_id": req.device_id,
            "pair_token": existing.get("pair_token"),
            "paired": existing.get("paired", False)
        }

    pair_token = generate_pair_token()

    try:
        supabase_client.client.table("devices").insert({
            "device_id": req.device_id,
            "device_name": req.device_name,
            "os": req.os,
            "pair_token": pair_token,
            "paired": False,
            "camera_enabled": True,
            "mic_enabled": True
        }).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "message": "Device registered",
        "device_id": req.device_id,
        "pair_token": pair_token
    }


@app.post("/api/device/pair")
def pair_device(req: DevicePairRequest):
    """
    Pair a device to a user.
    """
    if not supabase_client.enabled:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    if not req.device_id or not req.user_id:
        raise HTTPException(status_code=400, detail="device_id and user_id are required")

    try:
        # Update the device with the user_id to establish the pairing
        supabase_client.client.table("devices").update({
            "user_id": req.user_id,
            "paired": True
        }).eq("device_id", req.device_id).execute()

        return {
            "message": "Device paired successfully",
            "device_id": req.device_id,
            "user_id": req.user_id,
            "paired": True
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))