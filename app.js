express = require("express")
app = express()

app.set('port', process.env.PORT || 8080)

app.use(express.logger('tiny'))
app.use(express.static(__dirname + "/static"))
app.use(express.favicon())

app.listen(app.get('port'))

console.log('Goto localhost:' + app.get('port'))
