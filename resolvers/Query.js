const Query = {
    async me(_, args, {
        User,
        req
    }) {
        const userId = getUserId(req);
        return await User.findById(userId);
    }
}
module.exports = Query