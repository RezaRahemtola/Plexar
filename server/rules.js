export const Rules = {
    user: {
        password: {
            minLength: 6,
            maxLength: 100,
            forbiddenChars: [' ']
        },
        profilePicture: {
            minLength: 1,
            maxLength: 1,
            maxMbSize: 5
        }
    },
    product: {
        name: {
            minLength: 1,
            maxLength: 70
        },
        description: {
            minLength: 50,
            maxLength: 1000
        },
        coverImage: {
            minLength: 1,
            maxLength: 1,
            maxMbSize: 5
        },
        otherImages: {
            minLength: 0,
            maxLength: 4,
            maxMbSize: 5
        },
        categories: [
            'Alimentation',
            'Habitat & Jardin',
            'Informatique & High-Tech',
            'Recondionné & Seconde main',
            'Santé & Hygiène',
            'Sites web & Applications',
            'Vêtements & Accessoires',
        ]
    },
    levels: [
        {
            name: "1",
            pointsNeeded: 0,
            dailyVotingLimit: 10,
            voteMultiplicator: 1
        },
        {
            name: "2",
            pointsNeeded: 100,
            dailyVotingLimit: 10,
            voteMultiplicator: 1
        },
        {
            name: "3",
            pointsNeeded: 300,
            dailyVotingLimit: 10,
            voteMultiplicator: 1
        }
    ],
    points: {
        productAddition: 10,
        productModification: 5,
        productReport : 2,
        collectiveModerationVote: 1
    },
    moderation: {
        votesToApprove: 5,
        votesToReject: -5,
        dailyVotingLimit: 10
    },
    email: {
        sendingAddress: "Plexar <evan.houssette@gmail.com>",
        receptionAddress: "Reza Rahemtola <rahemtola.reza@gmail.com>"
    }
};
