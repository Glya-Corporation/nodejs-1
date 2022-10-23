const http = require('http');
const path = require('path');
const fs = require('fs/promises');

const PORT = 1811;

const app = http.createServer(async (req, res) => {
    const resMethod = req.method;
    const url = req.url;

    const jsonPath = path.resolve("./src/users.json");
    const jsonFile = await fs.readFile(jsonPath, 'utf8');
    const users = JSON.parse(jsonFile);
    
    if (url === '/apiv1/users') {

        if (resMethod === 'GET') {
            res.setHeader("Content-Type", "application/json");
            res.writeHead("200");
            res.write(jsonFile);
            res.end();
        }
        if (resMethod === 'POST') {
            req.on('data', data => {
                const newUser = JSON.parse(data);
                const check = users.find(user => user.id === newUser.id);
                if (!check) {
                    users.push(newUser);
                    fs.writeFile(jsonPath, JSON.stringify(users))
                    res.writeHead("201");
                } else {
                    console.log(`El usurario ${newUser.name} ya se encuentra registrado intente actualizar datos`);
                }
                res.end();
            })
        }
    }
    if (resMethod === 'DELETE') {
        const id = url.substring(url.length - 1, url.length)
        const newFile = users.filter(user => Number(user.id) !== Number(id))
        fs.writeFile(jsonPath, JSON.stringify(newFile))
        console.log("El usurario ha sido eliminado");
        res.writeHead("200");
        res.end();
    }
    if (resMethod === 'PUT') {
        req.on('data', data => {
            const selectedUser = JSON.parse(data);
            const id = url.substring(url.length - 1, url.length);
            let indexUser = null;
            let check = null
            users.forEach((user, index) => {
                if (Number(user.id) === Number(id)) {
                    check = {...user}
                    indexUser = index;
                }                
            });
            if (check !== null && indexUser !== null) {
                check.status = selectedUser.status
                users.splice(indexUser, 1, check)
                fs.writeFile(jsonPath, JSON.stringify(users))
                console.log("Cambios guardados");
                res.writeHead("201");
            } else {
                console.log(`El usurario datos`);
            }
            res.end();
        })
    }
    res.end();
});

app.listen(PORT);

console.log(`http://127.0.0.1:1811`);