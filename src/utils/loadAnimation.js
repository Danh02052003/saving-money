export const loadAnimation = async (type) => {
  const resources = {
    stamp: 'https://assets9.lottiefiles.com/packages/lf20_Ab7LYD.json',
    progress: 'https://assets2.lottiefiles.com/packages/lf20_2ks3pjua.json',
    welcome: 'https://assets2.lottiefiles.com/packages/lf20_2ks3pjua.json'
  };
  const res = await fetch(resources[type]);
  return await res.json();
}; 