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
            'Vêtements & Accessoires',
        ]
    },
    points: {
        productAddition: 10,
        productModification: 5,
        productReport : 2,
    },
    moderation: {
        votesToApprove: 5,
        votesToReject: -5,
        dailyVotingLimit: 10
    }
};
