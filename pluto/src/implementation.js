const  { promisify } = require('util')
const jwt = require('jsonwebtoken');
const User = require('./models/User');

module.exports = {
    async getUserById(call, callback) {
        const { id } = call.request;
        
        // Consultar o banco e retornar
        
        const data = await User.findById(id);

        return callback(null, { user: { email: data.email, username: data.username, password: undefined , id: data._id} });
    },
    async registerUser(call, callback) {
        const { email, username, password } = call.request;

        // Registrar no banco e retornar usuario com ID

        const data = await User.create({ email, username, password })

        return callback(null, { user: { email: data.email, username: data.username, password: data.password , id: data._id} });
    },

    async loginUser(call, callback) {
        const { email, password } = call.request.user;

        // Consultar o banco, verificar credenciais
        // e retornar token ou erro

        const user = await User.findOne({ email });

        if (!user) {
            return callback({ error: 'User not find'})
        }
        
        if (!await user.compareHash(password)) {
            return callback({ error: 'Wrong password!'})
        }

        const token = User.generateToken(user._id.toString())
        
        return callback(null, { token })
    },
    async authenticate(call, callback) {
        

        const { token: fullToken } = call.request;

        if(!fullToken) {
            return callback(null, { error: 'No token provided' })
        }
        
        const parts = fullToken.split(' ');

        if (!parts.length === 2) {
            return callback(null, { error: 'Token error' })
        }

        const [scheme, token] = parts;

        
        if (!/^Bearer$/i.test(scheme)) {
            return callback(null, { error: 'Token malformatted' });
        }

        try  {
            const decoded = jwt.verify(token, 'Jovinano codes');
            
            const { id } = decoded

            const user = await User.findById(id);
            
            console.log(user);
            
            return callback(null, { user: {...user.toObject(), id: user._id.toString() } });

        } catch (err) {
            return callback(null, { error: 'Invalid Token!' });
        }
    }
}