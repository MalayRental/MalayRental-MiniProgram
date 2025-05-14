// houses.js
// 房源地图数据

// 马来西亚Nilai附近的房源数据，实际项目中应通过API获取
const houses = [
  {
    id: 1,
    title: 'Nilai Impian公寓',
    price: 1200,
    size: 90,
    rooms: '3室2厅2卫',
    floor: '5/18层',
    type: '精装修',
    address: 'Nilai Impian, Nilai, Negeri Sembilan',
    description: '靠近INTI国际大学，环境安静，适合学生租住',
    longitude: 101.7917,
    latitude: 2.8292,
    imgUrl: 'https://img.51miz.com/Element/00/37/79/87/b1dba29f_E377987_e5a21e18.jpg'
  },
  {
    id: 2,
    title: 'Putra Nilai双层排屋',
    price: 1800,
    size: 150,
    rooms: '4室3厅3卫',
    floor: '双层排屋',
    type: '豪华装修',
    address: 'Putra Nilai, Nilai, Negeri Sembilan',
    description: '宽敞明亮，社区安全，靠近Nilai购物中心',
    longitude: 101.8064,
    latitude: 2.8253,
    imgUrl: 'https://img.51miz.com/Element/00/37/79/87/b1dba29f_E377987_e5a21e18.jpg'
  },
  {
    id: 3,
    title: 'Bandar Enstek单身公寓',
    price: 800,
    size: 45,
    rooms: '1室1厅1卫',
    floor: '8/12层',
    type: '简装修',
    address: 'Bandar Enstek, Nilai, Negeri Sembilan',
    description: '紧邻吉隆坡国际机场，交通便利，适合单身上班族',
    longitude: 101.7395,
    latitude: 2.7523,
    imgUrl: 'https://img.51miz.com/Element/00/37/79/87/b1dba29f_E377987_e5a21e18.jpg'
  },
  {
    id: 4,
    title: 'Nilai Springs高级公寓',
    price: 1500,
    size: 110,
    rooms: '3室2厅2卫',
    floor: '10/15层',
    type: '精装修',
    address: 'Nilai Springs Resort, Nilai, Negeri Sembilan',
    description: '临近高尔夫球场，景观优美，设施齐全',
    longitude: 101.7844,
    latitude: 2.8108,
    imgUrl: 'https://img.51miz.com/Element/00/37/79/87/b1dba29f_E377987_e5a21e18.jpg'
  },
  {
    id: 5,
    title: 'Kota Warisan联排别墅',
    price: 2200,
    size: 180,
    rooms: '5室3厅3卫',
    floor: '3层联排',
    type: '豪华装修',
    address: 'Kota Warisan, Sepang, Selangor',
    description: '宽敞舒适，私家花园，靠近学校和商场',
    longitude: 101.7153,
    latitude: 2.7832,
    imgUrl: 'https://img.51miz.com/Element/00/37/79/87/b1dba29f_E377987_e5a21e18.jpg'
  }
];

module.exports = {
  houses
}; 