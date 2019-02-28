async signup(_, {
        email,
        password
    }, {
        User
    }) {
        const user = await User.findOne({
            email
        });
        if (user) {
            throw new Error('User already exists');
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await new User({
            password: hashedPassword,
            email
        }).save();
        return {
            user: newUser,
            token: createToken(newUser, '1hr')
        };
    },
    async login(_, {
            email,
            password
        }, {
            User
        }) {
            const user = await User.findOne({
                email
            });
            if (!user) throw new Error('User not found');
            const isValidPassword = await bcryptjs.compare(password, user.password);
            if (!isValidPassword) throw new Error('Invalid password');
            return {
                user,
                token: createToken(user, '1hr')
            };
        },
        signinUser(_, {
            token,
            type
        }, {
            User
        }) {
            verify(token).catch(console.error);
            return {
                token: type
            };
        },