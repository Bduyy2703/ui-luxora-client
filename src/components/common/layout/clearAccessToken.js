import { useEffect } from "react";

function useClearTokenEvery5Seconds() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        console.log("Đã xóa accessToken sau 5 giây");
        localStorage.removeItem("accessToken");
      }
    }, 2700000);

    return () => clearInterval(intervalId);
  }, []);
}

export default useClearTokenEvery5Seconds;
