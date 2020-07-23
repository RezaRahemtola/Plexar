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
            maxMbSize: 5,
            defaultUrl: '/user.svg'
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
            'Informatique & High-Tech',
            'Reconditionné & Recyclage',
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
            dailyContributionsLimit: 10,
            voteMultiplicator: 1,
            icon: '/level1.png'
        },
        {
            name: "2",
            pointsNeeded: 100,
            dailyVotingLimit: 15,
            dailyContributionsLimit: 20,
            voteMultiplicator: 1,
            icon: '/level2.png'
        },
        {
            name: "3",
            pointsNeeded: 300,
            dailyVotingLimit: 30,
            dailyContributionsLimit: 30,
            voteMultiplicator: 2,
            icon: '/level3.png'
        },
        {
            name: "4",
            pointsNeeded: 1000,
            dailyVotingLimit: 50,
            dailyContributionsLimit: 40,
            voteMultiplicator: 3,
            icon: '/level4.png'
        }
    ],
    points: {
        productAddition: 20,
        productModification: 10,
        productReport : 5,
        collectiveModerationVote: 1
    },
    moderation: {
        votesToApprove: 5,
        votesToReject: -5
    },
    email: {
        verifyEmail: {
            sender: "Plexar <accounts@plexar.fr>"
        },
        resetPassword: {
            sender: "Plexar <accounts@plexar.fr>"
        },
        contactForm: {
            sender: "Plexar <contact@plexar.fr>",
            receiver: "Plexar <plexar.app@gmail.com>"
        }
    }
};
