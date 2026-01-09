fetch('http://localhost:5000/api/predictions/live')
    .then(res => console.log("Server Status:", res.status))
    .catch(err => console.error("Server Down:", err.cause));
