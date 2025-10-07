
export const getSimplifiedName = (fullName: string): string => {
  if (!fullName) return '';
  
  const names = fullName.trim().split(' ').filter(name => name.length > 0);
  
  if (names.length <= 1) {
    return fullName;
  }
  
  if (names.length === 2) {
    return fullName;
  }
  
  // Retorna primeiro e último nome
  return `${names[0]} ${names[names.length - 1]}`;
};
