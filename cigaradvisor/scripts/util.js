const categories = [
  'buying-guides',
  'cigar-humidification',
  'cigar-lifestyle',
  'cigar-makers',
  'industry-news',
  'cigar-reviews',
  'cigars-101',
  'cocktail',
  'cuban-cigar-guides',
  'uncategorized',
];

// Function to create ellipsis
function createEllipsis() {
  const listItem = document.createElement('li');
  const a = document.createElement('a');
  const span = document.createElement('span');
  a.className = 'gap';
  span.textContent = '...';
  a.appendChild(span);
  listItem.appendChild(a);
  return listItem;
}

// Function to create a page link
function createPageLink(pageNumber, text, className) {
  const listItem = document.createElement('li');
  const link = document.createElement('a');
  const currentPagePath = window.location.pathname;
  const currentPageQuery = window.location.search;
  link.href = `${currentPagePath}${currentPageQuery}#page=${pageNumber}`;
  link.textContent = text;

  if (className) {
    link.classList.add(className);
  }

  listItem.appendChild(link);
  return listItem;
}

// eslint-disable-next-line import/prefer-default-export
export function generatePagination(currentPage, totalPages) {
  const displayPages = 7;
  const paginationList = document.createElement('ol');
  paginationList.className = 'pagination';

  // Previous page link
  if (currentPage > 1) {
    paginationList.appendChild(createPageLink(currentPage - 1, '«', 'prev'));
  }

  // Page links
  const startPage = Math.max(1, currentPage - Math.floor(displayPages / 2));
  const endPage = Math.min(totalPages, startPage + displayPages - 1);

  if (startPage > 1) {
    paginationList.appendChild(createPageLink(1, '1'));
    if (startPage > 2) {
      paginationList.appendChild(createEllipsis());
    }
  }

  for (let i = startPage; i <= endPage; i += 1) {
    if (i === currentPage) {
      paginationList.appendChild(createPageLink(i, i, 'active'));
    } else {
      paginationList.appendChild(createPageLink(i, i));
    }
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationList.appendChild(createEllipsis());
    }
    paginationList.appendChild(createPageLink(totalPages, totalPages));
  }

  // Next page link
  if (currentPage < totalPages) {
    paginationList.appendChild(createPageLink(currentPage + 1, '»', 'next'));
  }
  return paginationList;
}

export function getCategory(path) {
  const regex = /\/cigaradvisor\/([^/]+)/;
  const match = path.match(regex);
  return (match && categories.includes(match)) ? `/cigaradvisor/${match}` : undefined;
}
