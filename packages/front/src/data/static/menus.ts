export const menu = [
  {
    id: 1,
    path: "/",
    label: "menu-main",
    columns: [
      {
        id: 1,
        columnItems: [
          {
            id: 1,
            label: "menu-collection",
            path:'/collections/',
            columnItemItems: [
              {
                id: 1,
                path: "/collections/on-sale",
                label: "menu-on-selling"
              },
              {
                id: 2,
                path: "/collections/womens-collection",
                label: "menu-women-collection"
              },
              {
                id: 3,
                path: "/collections/mens-collection",
                label: "menu-men-collection"
              },
              {
                id: 4,
                path: "/collections/flash-sale",
                label: "menu-flash-sales"
              },
              {
                id: 5,
                path: "/collections/featured-products",
                label: "menu-popular"
              },
              {
                id: 6,
                path: "/collections/kids-collection",
                label: "menu-kid-collection"
              },
              {
                id:7 ,
                path: "/collections/gift-collection",
                label: "menu-gift"
              },
              {
                id: 8,
                path: "/collections/winter-offer",
                label: "menu-summer-offer"
              }
            ]
          }
        ]
      },
      {
        id: 2,
        columnItems: [
          {
            id: 1,
            label: "menu-category",
            path:'/category/',
            columnItemItems: [
              {
                id: 1,
                path: "/category/women",
                label: "menu-women-wear"
              },
              {
                id: 2,
                path: "/category/men",
                label: "menu-men-wear"
              },
              {
                id: 3,
                path: "/category/kids",
                label: "menu-kids-wear"
              },
              {
                id: 4,
                path: "/category/sports",
                label: "menu-mask"
              },
              {
                id: 5,
                path: "/category/watch",
                label: "menu-vase"
              },
              {
                id: 6,
                path: "/category/chapeaux",
                label: "menu-hats"
              },
              {
                id: 7,
                path: "/category/sunglass",
                label: "menu-jewels"
              },
              {
                id: 8,
                path: "/category/sneakers",
                label: "menu-sneakers"
              },
              {
                id: 9,
                path: "/category/bags",
                label: "menu-bags"
              },
              {
                id: 10,
                path: "/category/echarpes-et-etoffes",
                label: "menu-scarves"
              },
            ]
          },
         
        ]
      },
    ]
  },
  {
    id: 2,
    path: "/a-propos",
    label: "menu-about"
  },
  {
    id: 3,
    path: "/devenir-vendeur",
    label: "menu-seller",
  },
  {
    id: 4,
    path: "/search",
    label: "menu-search"
  },
  {
    id: 5,
    path: "/shops",
    label: "menu-shops"
  },
  {
    id: 6,
    path: "/faq",
    label: "menu-faq"
  }
];

export const mobileMenu = [
  {
    id: 1,
    path: "/",
    label: "menu-home",
  },
  {
    id: 2,
    path: "#",
    label: "menu-collections",
    subMenu: [
      {
        id: 1,
        path: "/collections/on-sale",
        label: "on-sale"
      },
      {
        id: 2,
        path: "/collections/womens-collection",
        label: "Collecion femmes"
      },
      {
        id: 3,
        path: "/collections/mens-collection",
        label: "Collecion hommes"
      },
      {
        id: 4,
        path: "/collections/flash-sale",
        label: "Ventes falsh"
      },
      {
        id: 5,
        path: "/collections/featured-products",
        label: "Produits populaires"
      },
      {
        id: 6,
        path: "/collections/kids-collection",
        label: "Collecion enfants"
      },
      {
        id: 7,
        path: "/collections/gift-collection",
        label: "Cadeaux"
      },
      {
        id: 8,
        path: "/collections/winter-offer",
        label: "Offres d'été"
      }
    ]
  },
  {
    id: 3,
    path: "#",
    label: "Catégories",
    subMenu: [
      {
        id: 1,
        path: "/category/men",
        label: "menu-modern"
      },
      {
        id: 2,
        path: "/category/women",
        label: "menu-standard"
      },
      {
        id: 3,
        path: "/category/kids",
        label: "menu-minimal"
      },
      {
        id: 4,
        path: "/category/sports",
        label: "Masques"
      },
      {
        id: 5,
        path: "/category/watch",
        label: "Vases et pots"
      },
      {
        id: 6,
        path: "/category/chapeaux",
        label: "Chapeaux"
      },
      {
        id: 7,
        path: "/category/sunglass",
        label: "Bijoux"
      },
      {
        id: 8,
        path: "/category/sneakers",
        label: "Sandales"
      },
      {
        id: 9,
        path: "/category/bags",
        label: "Sacs"
      },
      {
        id: 10,
        path: "/category/echarpes-et-etoffes",
        label: "Echarpes et étoffes"
      },
    ]
  },
  {
    id: 4,
    path: "/a-propos",
    label: "A propos"
  },
  {
    id: 5,
    path: "/devenir-vendeur",
    label: "Devenir vendeur",
  },
  {
    id: 6,
    path: "/search",
    label: "menu-search"
  },
  {
    id: 7,
    path: "/shops",
    label: "menu-shops"
  },
  {
    id: 8,
    path: "/faq",
    label: "menu-faq"
  }
]