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
            'Beauté & Hygiène',
            'Informatique & High-Tech',
            'Recondionné & Seconde main',
            'Habitat & Jardin',
            'Vêtements & Mode',
        ]
    },
    points: {
        productAddition: 10,
        productModification: 5,
        productReport : 2,
        vote: 1
    }
};
