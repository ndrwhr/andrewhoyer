// Copyright (c) 2008 Andrew Hoyer

// Permission is hereby granted, free of charge, to any person 
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction, 
// including without limitation the rights to use, copy, modify, 
// merge, publish, distribute, sublicense, and/or sell copies of 
// the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be 
// included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
//EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
//OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
//NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
//WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
//DEALINGS IN THE SOFTWARE.

var BaconAndEggs = {
	VERSION: 0.1,
	PRECISION: 1e-6
};

function Matrix() {}
Matrix.prototype = {
	//adds the passed argument to the current instance.
	add: function(B){
		B = B.elements||B;
		if(typeof(B) == 'number'){
			return this.mapSingle(function(X){return X+B;});
		}if(this.areSameSize(B)){
			return this.mapMultiple(function(X,Y){return X+Y;},B);
		}
		return null;
	},
	//returns true if the current instance is the same
	//size as the passed matrix B.
	areSameSize: function(B){
		B = B.elements||B;
		if(typeof(B[0][0]) == 'undefined'){
			return false;
		}
		return (this.cols()==B.length&&this.rows()==B[0].length);
	},
	//appends B to the right side of the current instance.
	augment: function(B){
		var _augment = B.elements||B;
		var _elements = this.elements;
		var i,j;
		for(i=0; i<this.rows(); i++){
			_elements[i] = _elements[i].concat(_augment[i]);
		}
		return Matrix.create(_elements);
	},
	//returns true if the current instance can be multiplied by
	//B, false otherwise.
	canMultiply: function(B){
		B = B.elements||B;
		return this.cols()==B.length;
	},
	//if any value is less that the precision set, put a 0 in.
	checkPrecision: function(){
		fn = function(X){
			if(Math.abs(X)<BaconAndEggs.PRECISION){
				return 0;
			}else{
				return X;
			}
		};
		return this.mapSingle(fn);
	},
	//returns the number of columns in the matrix
	cols: function(){
		return this.elements[0].length;
	},
	//returns the determinant of the given matrix
	//or null if the matrix is not a square matrix.
	determinant: function(){
		if(!this.isSquare()){
			return null;
		}
		//short cut for doing the determinant.
		if(this.rows() == 2){
			return (this.elementAt(1,1)*this.elementAt(2,2))-
					(this.elementAt(2,1)*this.elementAt(1,2));
		}
		//short cut for doing the determinant.
		if(this.rows() == 3){
			return ((this.elementAt(1,1)*this.elementAt(2,2)*this.elementAt(3,3))+
					(this.elementAt(1,2)*this.elementAt(2,3)*this.elementAt(3,1))+
					(this.elementAt(1,3)*this.elementAt(2,1)*this.elementAt(3,2))-
					(this.elementAt(3,1)*this.elementAt(2,2)*this.elementAt(1,3))-
					(this.elementAt(3,2)*this.elementAt(2,3)*this.elementAt(1,1))-
					(this.elementAt(3,3)*this.elementAt(2,1)*this.elementAt(1,2)));
		}
		var i,m = this.rows(),det = 1;	
		var LU = this.luDecompose();
		LU.L = LU.P.multiply(LU.L);
		
		for(i=1; i<=m ;i++){
			det = det * LU.L.elementAt(i,i);
			det = det * LU.U.elementAt(i,i);
		}
		return (Math.pow(-1,LU.S)*det);
	},
	//returns the diagonal elements the current instance.
	diagonals: function(){
		var n = Math.min(this.rows(),this.cols());
		var _dias = [], i;
		for(i=0; i<n; i++){
			_dias[i] = this.elementAt(i+1,i+1);
		}
		return Vector.create(_dias);
	},
	//duplicate the current matrix, returns a new matrix
	//exactly like the current instance.
	duplicate: function(){
		return Matrix.create(this.elements);
	},
	//return the element stored at index i j
	elementAt: function(i,j){
		if(i>this.rows() || j>this.cols())
			return null;
		return this.elements[i-1][j-1];
	},
	//if the current instance is equal to the passed
	//matrix then return true
	equals: function(B){
		B = B.elements||B;
		if(!this.areSameSize(B))
			return false;
		var m=this.rows(),n=this.cols(),i,j;
		for(i=0; i<m ;i++){
			for(j=0; j<n ; j++){
				if(this.elements[i][j]!=B[i][j])
					return false;
			}	
		}
		return true;
	},
	
	//returns the column at index n.
	getCol: function(n){
		if(n>this.cols()||n<1){ return null; }
		var C = [], m = this.rows(),i;
		for(i=0; i<m ;i++){
			C[i] = this.elements[i][n-1];
		}
		return Vector.create(C);
	},
	//returns the row at index m.
	getRow: function(m){
		if(m>this.rows()||m<1)
			return null;
		return Vector.create(this.elements[m-1]);
	},
	//returns the index of the first occurence of V.
	indexOf: function(V){
		if(typeof(V) != 'number')
			return null;
		var i,j,_elements = this.elements;
		for(i=0; i<this.rows(); i++){
			for(j=0; j<this.cols(); j++){
				if(_elements[i][j] === V){
					return {i:i+1,j:j+1};
				}
			}
		}
		return null;
	},
	
	//calculate the inverse using LU decomposition.
	inverse: function(){
		
		if(!this.isSquare())
			return null;
		if(this.rows() == 2){
			if(this.determinant() != 0){
				var s = (1/(this.elementAt(1,1)*this.elementAt(2,2)-this.elementAt(2,1)*this.elementAt(1,2)));
				var M = Matrix.create([[this.elementAt(2,2),-this.elementAt(1,2)],[-this.elementAt(2,1),this.elementAt(1,1)]]);
				return M.multiply(s);
			}
		}
		var i,j,m=this.rows(),n=this.cols(),det=1;
		var LU = this.luDecompose();
		var L = LU.P.multiply(LU.L);
		var U = LU.U;
		//if the det is 0 then there is no inverse
		for(i=1; i<=m ;i++){
			det = det*L.elementAt(i,i)*U.elementAt(i,i);
		}
		if(det == 0)
			return null;
		
		var Li = LU.P.duplicate();
		var Ui = Matrix.ident(Li.rows());
		var ju,jl,iu,il;
		var u,l,El,Eu;
		
		//perform the inverse of L and U at the same time.
		for(ju=n,jl=1; ju>0 ;ju--,jl++){
			u = U.elementAt(ju,ju);
			l = L.elementAt(jl,jl);
			//build the transformations
			Eu = Matrix.ident(m); Eu.setElement(ju,ju,1/u);
			El = Matrix.ident(m); El.setElement(jl,jl,1/l);
			for(iu=ju-1, il=jl+1; iu>0 ;iu--, il++){
				Eu.setElement(iu,ju,-U.elementAt(iu,ju)/l);
				El.setElement(il,jl,-L.elementAt(il,jl)/u);
			}
			//apply the transformations
			Ui = Eu.multiply(Ui);
			Li = El.multiply(Li);
		}
		//multiply the two inverses together to get the result
		return Ui.multiply(Li);
	},
	//returns true if the current instance is square.
	isSquare: function(){
		return this.cols()==this.rows();
	},
	//decompose the current matrix into matrices L and U and P.
	luDecompose: function(){
		if(!this.isSquare())
			return null;
		
		var i,j,k,max_i,S=0;
		var m=this.rows(),n=this.cols();
		
		//initializae an the require matrices.
		var U=this.duplicate();
		var I=Matrix.ident(m),P=I.duplicate(),L=I.duplicate();
		
		//for each column in the current matrix loop over each element
		//searching for the largest pivot.
		for(j=1; j<n ;j++){
			//find the largest pivot in the current column.
			max_i=j;
			max_v=Math.abs(U.elementAt(j,j));
			for(i=j+1; i<=m ;i++){
				var v = Math.abs(U.elementAt(i,j));
				if(v>max_v){
					max_i = i;
					max_v = v;
				}
			}
			//if a new max in the current row was found, swap them.
			var tmpP = I.duplicate();
			if(max_i != j){
				//create a swap matrix.
				tmpP = tmpP.swapRows(max_i,j);
				S++;
			}
			//apply the swap matrix (if no swapping took place
			//this has no effect on anything).
			U = tmpP.multiply(U);
			L = L.multiply(tmpP.transpose());
			P = tmpP.multiply(P);
			//if the pivot element is not 0 then scale 
			if(Math.abs(U.elementAt(j,j)) > BaconAndEggs.PRECISION){
				//compute the transformation matrix;
				var E = I.duplicate();
				var L1 = I.duplicate();
				for(i=j+1; i<=n ;i++){
					E.setElement(i,j,-U.elementAt(i,j)/U.elementAt(j,j));
					L1.setElement(i,j,U.elementAt(i,j)/U.elementAt(j,j));
				}
				//apply the transformation to U and L
				U = E.multiply(U);
				L = L.multiply(L1);
			}
		}
		//Return:
		//L = lower triangular matrix.
		//U = upper triangular matrix.
		//P = pivot matrix.
		//S = number of swaps that took place
		return {L:L,U:U,P:P,S:S};
	},
	//map every element of the current matrix to a binary function.
	mapMultiple: function(fn,Arg){
		var m=this.rows(),n=this.cols();
		var i,j;
		var _elements = [];
		for(i=0; i<m ;i++){
			_elements[i] = [];
			for(j=0; j<n ;j++){
				_elements[i][j] = fn(this.elements[i][j],Arg[i][j]);
			}
		}
		return Matrix.create(_elements);
	},
	//map every element of the current matrix to a unary function.
	mapSingle: function(fn){
		var m=this.rows(),n=this.cols();
		var i,j;
		var _elements = [];
		for(i=0; i<m ;i++){
			_elements[i] = [];
			for(j=0; j<n ;j++){
				_elements[i][j] = fn(this.elements[i][j]);
			}
		}
		return Matrix.create(_elements);
	},
	//returns the submatrix from the row sm and col sn
	//to the row em and col en, inclusively.
	minor: function(sm,sn,em,en){
		var m=this.rows(), n = this.cols();
		if(sm>m||em>m || sn>n||en>n)
			return null;
		if(sm>em || sn>en)
			return null;
		var i,j,M = [];
		for(i=sm-1; i<em ;i++){
			M[i-sm+1] = [];
			for(j=sn-1; j<en ;j++){
				M[i-sm+1][j-sn+1] = this.elements[i][j];
			}
		}
		return Matrix.create(M);
	},
	//multiplies the current instance by B
	multiply: function(B){
		var isVector = false;
		B = B.elements || B;
		//if multiplying by a scalar
		if(typeof(B)=='number')
			return this.mapSingle(function(X){ return X*B});
		if(!this.canMultiply(B))
			return null;
		//if multiplying by a vector, set it up accordingly
		if(typeof(B[0][0]) == 'undefined'){
			var tmp = [];
			for(var z=0; z<B.length; z++){
				tmp[z] = [B[z]];
			}
			B = Matrix.create(tmp);
			B = B.elements;
			isVector = true;
		}
			
		var m=this.rows(),n=this.cols();
		var Bm=B.length,Bn=B[0].length;
		var _elements = [];
		for(var i=0; i<m ; i++){
			_elements[i] = [];
			for(var j=0; j<Bn ;j++){
				var tmp = 0;
				for(var k=0; k<n ;k++){
					tmp += this.elements[i][k]*B[k][j];
				}
				_elements[i][j] = tmp;
			}
		}
		//if the passed var was a vector, return a vector
		if(isVector){
			var _els = [];
			for(i=0; i<m ;i++){
				_els[i] = _elements[i][0];
			}
			return Vector.create(_els);
		}
		//else return a matrix
		return Matrix.create(_elements);
	},
	//decompose the current instance into Q and R matrices
	qrDecompose: function(){
		return null;
	},
	//rounds all elements to the nearest integer;
	round: function(){
		var _elements = this.elements;
		var i,j;
		for(i=0; i<this.rows(); i++){
			for(j=0; j<this.cols(); j++){
				_elements[i][j] = Math.round(_elements[i][j]);
			}
		}
		return Matrix.create(_elements);
	},
	//returns the number of rows in the matrix
	rows: function(){
		return this.elements.length;
	},
	setCol: function(j,C){
		C = C.elements||C;
		var i,m = this.rows();
		for(i=0; i<m ;i++){
			this.elements[i][j] = C[i];
		}
		return this;
	},
	//set the element at i,j to the passed V
	setElement: function(i,j,V){
		if(i>this.rows()||j>this.cols()||i<1||j<1)
			return;
		if(typeof(V) == 'number')
			this.elements[i-1][j-1] = V;
		else
			this.elements[i-1][j-1] = 'undefined';
	},
	//set the elements to the passed Matrix,Array,Vector.
	setElements: function(_els){
		_els = _els.elements||_els;
		//if the supplied variable is a vector create a nx1 matrix.
		if(typeof(_els[0][0]) == 'undefined'){
			var tmp = [];
			for(var z=0; z<_els.length; z++){
				tmp[z] = [_els[z]];
			}
			this.elements = tmp;
			return this;
		}
		//if the supplied variable is a an array
		var m=_els.length, i;
		this.elements = [];
		for(i=0; i<m ;i++){
			this.elements[i] = _els[i].slice(0);
		}
		return this;
	},
	//solve the current instance with respect to vector b,
	//if the current instance is square, LU will be used,
	//if it is overdetermined, QR factorization will be used 
	//and if it is underdetermined null is returned.
	solve: function(b){
		if(this.isSquare())
			return this.solveWithLU(b);
		else if(this.rows()>this.cols())
			return this.solveWithQR(b);
		else
			return null;
	},
	//returns a the number rows and cols
	size: function(){
		return {rows: this.rows(), cols: this.cols()};
	},
	//Solves the current matrix using LU decomposition and
	//returns the vector representing the solution.
	solveWithLU: function(b){
		b = Vector.create(b.elements||b);
		if(this.rows()!=b.size())
			return null;
		var m=this.rows(),n=this.cols();
		var i,j;
		//decompose the current instance into L and U matrices.
		var LU = this.luDecompose();
		//apply the pivot matrix to L and B.
		LU.L = LU.P.multiply(LU.L);
		b = LU.P.multiply(b).elements;

		//perform PL_y=Pb using forward substitution
		var _y = [];
		for(j=1; j<=n ;j++){
			if(Math.abs(LU.L.elementAt(j,j)) < BaconAndEggs.PRECISION){
				return null;
			}
			_y[j-1] = b[j-1]/LU.L.elementAt(j,j);
			for(i=j+1; i<=m ;i++){
				b[i-1] = b[i-1] - LU.L.elementAt(i,j)*_y[j-1];
			}
		}
		//solve Ux=y using backward substitution.
		var _x = [];
		for(j=m; j>0 ;j--){
			if(Math.abs(LU.U.elementAt(j,j)) < BaconAndEggs.PRECISION){
				return null;
			}
			_x[j-1] = _y[j-1]/LU.U.elementAt(j,j);
			for(i=1; i<j ;i++){
				_y[i-1] = _y[i-1] - LU.U.elementAt(i,j)*_x[j-1];
			}
		}
		return Vector.create(_x);
	},
	solveWithQR: function(b){
		var i,j,k,m=this.rows(),n=this.cols();
		var R = this.duplicate();
		var currR;
		var akk,alpha,beta,gamma;
		var Aj,Ak,Vk;
		
		for(k=1; k<=n ;k++){
			currR = R.minor(k,k,m,n);
			Ak = currR.getCol(1);
			akk = Ak.elementAt(1);
			if(Math.abs(akk)>BaconAndEggs.PRECISION)
				alpha = -(akk/Math.abs(akk))*Ak.length();
			else
				alpha = Ak.length();
			//compute the householder vector
			Vk = R.getCol(k);
			for(j=1; j<k ;j++){
				Vk.setElement(j,0);
			}
			
			Vk = Vk.subtract(Vector.zeros(m).setElement(k,alpha));
			beta = Vk.dot(Vk);
			
			if(Math.abs(beta) > BaconAndEggs.PRECISION){
				for(j=k; j<=n ;j++){
					Aj = R.getCol(j);
					gamma = Vk.dot(Aj);
					Aj = Aj.subtract(Vk.scale(2*gamma/beta));
					R.setCol(j-1,Aj);
				}
				gamma = Vk.dot(b);
				b = b.subtract(Vk.scale(2*gamma/beta));
			}
		}
		
		R = R.checkPrecision();
		
		var x = Vector.zeros(n);
		for(j=n; j>0; j--){
			if(Math.abs(R.elementAt(j,j)) < BaconAndEggs.PRECISION){
				return null;
			}
			x.setElement(j, b.elementAt(j)/R.elementAt(j,j) );
			for(i=1; i<j ;i++){
				b.setElement(i,b.elementAt(i)- R.elementAt(i,j)*x.elementAt(j));
			}
		}
		return x;
	},
	//subtracts the passed argument from the current instance.
	subtract: function(B){
		B = B.elements||B;
		if(typeof(B) == 'number')
			return this.mapSingle(function(X){return X-B});
		if(this.areSameSize(B))
			return this.mapMultiple(function(X,Y){return X-Y},B);
		return null;
	},
	//swaps the cols at the given indices
	swapCols: function(i,j){
		if(i>this.cols()||j>this.cols()||i<1||j<1)
			return null;
		var _elements = this.elements, tmp;
		var m=this.rows(), k;
		for(k=0; k<m ;k++){
			tmp = _elements[k][i-1];
			_elements[k][i-1] = _elements[k][j-1];
			_elements[k][j-1] = tmp;
		}
		return Matrix.create(_elements);
	},

	//swaps the rows at the given indices
	swapRows: function(i,j){
		if(i>this.rows()||j>this.rows()||i<1||j<1)
			return null;
		var _elements = this.elements;
		var tmp = _elements[i-1];
		_elements[i-1] = _elements[j-1];
		_elements[j-1] = tmp;
		return Matrix.create(_elements);
	},
	//formats the matrix into a string, mainly for debugging.
	toString: function(){
		var m=this.rows(),n=this.cols(),str = "";
		for(i=0;i<m;i++){
			for(j=0;j<n;j++){
				str += this.elements[i][j] + ", ";
			}
			str+="<br>";
		}
		return str;
	},
	//returns the trace of the current instance.
	trace: function(){
		var m=Math.max(this.rows(),this.cols());
		var tmp=0,i;
		for(i=0;i<m;i++){
			tmp+=this.elements[i][i];
		}
		return tmp;
	},
	//returns the transpose of the current instance
	transpose: function(){
		var _elements = this.elements;
		var i, j, m=this.rows(),n=this.cols();
		var result = [];
		for(j=0; j<n ;j++){
			result[j] = [];
			for(i=0; i<m ;i++){
				result[j][i] = _elements[i][j];
			}
		}
		return Matrix.create(result);
	}
};
//create a matrix with its elements set to _elements
Matrix.create = function(_elements){
	if(_elements==null) return null;
	var newMatrix = new Matrix();
	return newMatrix.setElements(_elements);
};
//create an identity matrix of size nxn
Matrix.ident = function(n){
	if(n==null) return null;
	var _elements = [];
	for(var i=0; i<n ;i++){
		_elements[i] = [];
		for(var j=0; j<n ;j++){
			_elements[i][j] = (i==j)?1:0;
		}
	}
	return Matrix.create(_elements);
};
//fill an mxn matrix with the value N.
Matrix.fill = function(m,n,N){
	if(m==null||n==null||N==null)
		return null;
	var _elements = [];
	for(var i=0; i<m ;i++){
		_elements[i] = [];
		for(var j=0; j<n ;j++){
			_elements[i][j] = N;
		}
	}
	return Matrix.create(_elements);
};
//create zero matrix of size mxn
Matrix.zeros = function(m,n){
	if(m==null) return null;
	if(n==null) n = m;
	return Matrix.fill(m,n,0);
};





function Vector(){};
Vector.prototype = {
	//add the passed argument to the current instance.
	add: function(B){
		B = B.elements || B;
		if(typeof(B) == 'number')
			return this.mapSingle(function(X){return X+B});
		else
			return this.mapMultiple(function(X,Y){return X+Y},B);
	},
	canMultiply: function(B){
		B = B.elements || B;
		if(typeof(B) == 'number'){
			return true;
		}else if(B.length = this.size()){
			return true;
		}
		return false;
	},
	//if any value is less that the precision set, put a 0 in.
	checkPrecision: function(){
		fn = function(X){
			if(Math.abs(X)<BaconAndEggs.PRECISION)
				return 0;
			else
				return X;
		};
		return this.mapSingle(fn);
	},
	//returns the dot product of this against B
	dot: function(B){
		var _elements = B.elements || B;
		var result = 0;//, n = this.size();	
		if(_elements.length != this.n)
			return null;
		for(i=0; i<n ;i++){
			result += this.elements[i]*_elements[i];
		}
		return result;
	},
	//return the element at the specified index.
	elementAt: function(i){
		if(i<1 || i>this.n)
			return null;
		return this.elements[i-1];
	},
	//return the euclidean length of the vector.
	euclidLength: function(){
		var i, result=0;//, n=this.size();
		for(i=0; i<this.n ;i++){
			result += (this.elements[i]*this.elements[i]);
		}
		return Math.sqrt(result);
	},
	//map every element of the current vector to a binary function.
	mapMultiple: function(fn,Arg){
		var i;//,n=this.size();
		var _elements = [];
		for(i=0; i<this.n ;i++){
			_elements[i] = fn(this.elements[i],Arg[i]);
		}
		return Vector.create(_elements);
	},
	
	//map every element of the current vector to a unary function.
	mapSingle: function(fn){
		var i;//,n=this.size();
		var _elements = [];
		for(i=0; i<this.n ;i++){
			_elements[i] = fn(this.elements[i]);
		}
		return Vector.create(_elements);
	},
	//multiply the vector by the passed argument
	multiply: function(B){
		B = B.elements || B;
		if(typeof(B) == "Number"){
			return this.scale(B);
		}else{
			return this.dot(B);
		}
	},
	//return the p-norm of the given matrix.
	norm: function(p){
		var i, result=0, n=this.size();
		for(i=0; i<n ;i++){
			result += Math.pow(this.elements[i],p);
		}
		return Math.pow(result, 1/p);
	},	
	//round every element to the nearest integer
	round: function(){
		return this.mapSingle(function(X){return Math.round(X)});
	},
	//scale the vector by the passed argument.
	scale: function(B){
		return this.mapSingle(function(X){return X*B});
	},
	//set the element at i to N.
	setElement: function(i,N){
		if(i>this.size()||i<1)
			return;
		this.elements[i-1] = N;
		return this;
	},
	//set the elements to passed argument.
	setElements: function(_elements){
		_elements = _elements.elements || _elements;
		this.elements = _elements.slice(0);
		this.n = this.elements.length;
		return this;
	},
	//return the dimension of the vector.
	size: function(){
		return this.elements.length;
	},
	sum: function(){
		return this.norm(1);
	},
	//return the length of the vector without the square root.
	squaredLength: function(){
		return this.mapSingle(function(X){return X*X}).norm(1);
	},
	//subtract the argument from the current instance.
	subtract: function(B){
		B = B.elements || B;
		if(typeof(B) == 'number')
			return this.mapSingle(function(X){return X-B});
		else
			return this.mapMultiple(function(X,Y){return X-Y},B);	
	},
	//mainly for debugging
	toString: function(){
		var str = "", i, n = this.size();
		for(i=0; i<n ;i++){
			str += this.elements[i] + ", ";
		}
		return str;
	}
};

Vector.create = function(elements){
	var newVector = new Vector();
	return newVector.setElements(elements);
};
Vector.fill = function(n,N){
	var _elements = [],i;
	for(i=0; i<n ;i++){
		_elements[i] = N;
	}
	return Vector.create(_elements);
};
Vector.zeros = function(n){
	return Vector.fill(n,0);
};


//shortcut helper functions.
var $V = Vector.create;
var $M = Matrix.create;



