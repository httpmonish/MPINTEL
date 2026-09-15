from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseSatelliteProvider(ABC):
    name: str
    display_name: str

    @abstractmethod
    def check_availability(self, lat: float, lon: float) -> bool:
        pass

    @abstractmethod
    def search_imagery(self, lat: float, lon: float, radius: float, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_image(self, reference_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_metadata(self, reference_id: str) -> Dict[str, Any]:
        pass
