require('dotenv/config');

export const isAuthenticated = async (req,res,next) => {
    if(!req.query.apiKey) {
        return res.status(401).send({ message : 'API-KEY missing'});
    }
    else{
        const {apiKey} = req.query;
        if(apiKey === '12345asdfre@KFHDHSKJ158464^$%'){
            return next();
        }
        else{
            return res.status(401).send({ message : 'API-KEY is not valid'});
        }
    }
}